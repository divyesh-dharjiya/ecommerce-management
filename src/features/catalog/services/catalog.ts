import { commerceConfig } from "@/config/site";
import { discountPercent } from "@/lib/utils";
import type { Product, ProductQuery, ProductQueryResult, SortOption } from "@/types";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
];

export const isSortOption = (value: unknown): value is SortOption =>
  SORT_OPTIONS.some((o) => o.value === value);

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

export const tokenize = (s: string) => normalise(s).split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Relevance score for a product against a free-text query.
 * Every token must match somewhere (AND semantics); matches in the title
 * weigh more than brand/category, which weigh more than tags/description.
 * Returns 0 when the product does not match.
 */
export function scoreProduct(product: Product, query: string): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 1;

  const fields: [string, number][] = [
    [normalise(product.title), 10],
    [normalise(product.brand), 6],
    [normalise(product.category.replace(/-/g, " ")), 5],
    [normalise(product.tags.join(" ")), 4],
    [normalise(product.sku), 3],
    [normalise(product.description), 1],
  ];

  let score = 0;
  for (const token of tokens) {
    let tokenScore = 0;
    for (const [text, weight] of fields) {
      const idx = text.indexOf(token);
      if (idx === -1) continue;
      // Reward word-prefix matches ("lap" → "laptop") over infix matches.
      const atWordStart = idx === 0 || /[^a-z0-9]/.test(text[idx - 1] ?? "");
      tokenScore = Math.max(tokenScore, atWordStart ? weight * 1.5 : weight);
    }
    if (tokenScore === 0) return 0;
    score += tokenScore;
  }
  // Exact phrase in title is a strong signal.
  if (normalise(product.title).includes(normalise(query.trim()))) score += 15;
  return score;
}

const comparators: Record<Exclude<SortOption, "featured">, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  "best-selling": (a, b) => b.soldCount - a.soldCount,
  discount: (a, b) =>
    discountPercent(b.price, b.compareAtPrice) - discountPercent(a.price, a.compareAtPrice),
};

export function sortProducts(products: Product[], sort: SortOption = "featured"): Product[] {
  const list = [...products];
  if (sort === "featured") {
    return list.sort(
      (a, b) =>
        Number(b.isFeatured) - Number(a.isFeatured) ||
        b.rating * Math.log10(b.soldCount + 10) - a.rating * Math.log10(a.soldCount + 10),
    );
  }
  return list.sort(comparators[sort]);
}

/** Filters, ranks, sorts and paginates the catalog. Pure — safe to unit test and memoise. */
export function queryProducts(products: Product[], query: ProductQuery = {}): ProductQueryResult {
  const {
    search = "",
    category,
    brands,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    onSale,
    sort,
    page = 1,
    pageSize = commerceConfig.defaultPageSize,
  } = query;

  const brandSet = brands && brands.length > 0 ? new Set(brands) : null;
  const hasSearch = search.trim().length > 0;
  const scores = new Map<string, number>();

  const filtered = products.filter((p) => {
    if (p.status !== "active") return false;
    if (category && p.category !== category) return false;
    if (brandSet && !brandSet.has(p.brand)) return false;
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    if (minRating !== undefined && p.rating < minRating) return false;
    if (inStock && p.stock <= 0) return false;
    if (onSale && discountPercent(p.price, p.compareAtPrice) === 0) return false;
    if (hasSearch) {
      const s = scoreProduct(p, search);
      if (s === 0) return false;
      scores.set(p.id, s);
    }
    return true;
  });

  // With a search term and no explicit sort, rank by relevance.
  const sorted =
    hasSearch && (!sort || sort === "featured")
      ? filtered.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0))
      : sortProducts(filtered, sort);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page: safePage,
    pageCount,
    pageSize,
  };
}

export interface CatalogFacets {
  brands: { name: string; count: number }[];
  priceRange: { min: number; max: number };
}

export function getFacets(products: Product[], category?: string): CatalogFacets {
  const scoped = products.filter(
    (p) => p.status === "active" && (!category || p.category === category),
  );
  const brandCounts = new Map<string, number>();
  let min = Infinity;
  let max = 0;
  for (const p of scoped) {
    brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
    min = Math.min(min, p.price);
    max = Math.max(max, p.price);
  }
  return {
    brands: [...brandCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    priceRange: {
      min: Number.isFinite(min) ? Math.floor(min) : 0,
      max: Math.ceil(max),
    },
  };
}

export function getRelatedProducts(products: Product[], product: Product, limit = 8): Product[] {
  const tagSet = new Set(product.tags);
  return products
    .filter((p) => p.id !== product.id && p.status === "active")
    .map((p) => ({
      p,
      score:
        (p.category === product.category ? 5 : 0) +
        (p.brand === product.brand ? 3 : 0) +
        p.tags.filter((t) => tagSet.has(t)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .slice(0, limit)
    .map(({ p }) => p);
}
