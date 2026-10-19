import { isSortOption } from "@/features/catalog/services/catalog";
import type { ProductQuery } from "@/types";

type ParamsLike = { get(name: string): string | null };

const num = (v: string | null) => {
  if (v === null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/**
 * URL ⇄ query mapping. The URL is the single source of truth for listing
 * state so filters are shareable, bookmarkable and survive refresh/back.
 */
export function parseProductQuery(params: ParamsLike): ProductQuery {
  const sort = params.get("sort");
  const brands = params
    .get("brand")
    ?.split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  const page = num(params.get("page"));
  return {
    search: params.get("q")?.trim() || undefined,
    category: params.get("category") || undefined,
    brands: brands && brands.length ? brands : undefined,
    minPrice: num(params.get("min")),
    maxPrice: num(params.get("max")),
    minRating: num(params.get("rating")),
    inStock: params.get("stock") === "1" || undefined,
    onSale: params.get("onSale") === "1" || undefined,
    sort: isSortOption(sort) ? sort : undefined,
    page: page && page >= 1 ? Math.floor(page) : undefined,
  };
}

export function serializeProductQuery(q: ProductQuery): string {
  const p = new URLSearchParams();
  if (q.search) p.set("q", q.search);
  if (q.category) p.set("category", q.category);
  if (q.brands?.length) p.set("brand", q.brands.join(","));
  if (q.minPrice !== undefined) p.set("min", String(q.minPrice));
  if (q.maxPrice !== undefined) p.set("max", String(q.maxPrice));
  if (q.minRating !== undefined) p.set("rating", String(q.minRating));
  if (q.inStock) p.set("stock", "1");
  if (q.onSale) p.set("onSale", "1");
  if (q.sort && q.sort !== "featured") p.set("sort", q.sort);
  if (q.page && q.page > 1) p.set("page", String(q.page));
  return p.toString();
}

/** Number of user-applied filters (excludes search, sort and pagination). */
export function countActiveFilters(q: ProductQuery, lockedCategory?: string) {
  return (
    (q.category && q.category !== lockedCategory ? 1 : 0) +
    (q.brands?.length ?? 0) +
    (q.minPrice !== undefined || q.maxPrice !== undefined ? 1 : 0) +
    (q.minRating !== undefined ? 1 : 0) +
    (q.inStock ? 1 : 0) +
    (q.onSale ? 1 : 0)
  );
}

/** Converts Next.js `searchParams` (server) into a URLSearchParams-like reader. */
export function toSearchParams(record: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined) params.set(key, value[0]);
  }
  return params;
}
