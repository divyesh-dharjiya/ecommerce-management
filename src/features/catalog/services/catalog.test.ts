import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "@/data";
import { getFacets, getRelatedProducts, queryProducts, scoreProduct, sortProducts } from "@/features/catalog/services/catalog";
import type { Product } from "@/types";

const base = SEED_PRODUCTS[0]!;
const make = (over: Partial<Product>): Product => ({ ...base, id: Math.random().toString(36), ...over });

describe("seed catalog", () => {
  it("ships exactly 100 products with unique ids and slugs", () => {
    expect(SEED_PRODUCTS).toHaveLength(100);
    expect(new Set(SEED_PRODUCTS.map((p) => p.id)).size).toBe(100);
    expect(new Set(SEED_PRODUCTS.map((p) => p.slug)).size).toBe(100);
  });

  it("every product has an image and a positive price", () => {
    for (const p of SEED_PRODUCTS) {
      expect(p.thumbnail).toMatch(/^https:\/\//);
      expect(p.price).toBeGreaterThan(0);
    }
  });
});

describe("scoreProduct", () => {
  const phone = make({ title: "iPhone 13 Pro", brand: "Apple", category: "smartphones", tags: ["mobile"], description: "A phone" });

  it("matches title prefixes and ranks title above description", () => {
    expect(scoreProduct(phone, "iph")).toBeGreaterThan(0);
    expect(scoreProduct(phone, "iphone")).toBeGreaterThan(scoreProduct(phone, "phone"));
  });

  it("requires every token to match (AND semantics)", () => {
    expect(scoreProduct(phone, "apple pro")).toBeGreaterThan(0);
    expect(scoreProduct(phone, "apple laptop")).toBe(0);
  });

  it("is case and accent insensitive", () => {
    expect(scoreProduct(make({ title: "Crème Brûlée Candle" }), "creme brulee")).toBeGreaterThan(0);
  });
});

describe("queryProducts", () => {
  it("paginates and clamps out-of-range pages", () => {
    const r = queryProducts(SEED_PRODUCTS, { pageSize: 12, page: 999 });
    expect(r.total).toBe(100);
    expect(r.pageCount).toBe(9);
    expect(r.page).toBe(9);
    expect(r.items).toHaveLength(4);
  });

  it("filters by category, price, rating and stock together", () => {
    const r = queryProducts(SEED_PRODUCTS, { category: "smartphones", minPrice: 100, maxPrice: 1000, minRating: 3, inStock: true, pageSize: 100 });
    expect(r.items.length).toBeGreaterThan(0);
    for (const p of r.items) {
      expect(p.category).toBe("smartphones");
      expect(p.price).toBeGreaterThanOrEqual(100);
      expect(p.price).toBeLessThanOrEqual(1000);
      expect(p.rating).toBeGreaterThanOrEqual(3);
      expect(p.stock).toBeGreaterThan(0);
    }
  });

  it("excludes non-active products", () => {
    const list = [make({ status: "draft" }), make({ status: "active" })];
    expect(queryProducts(list).total).toBe(1);
  });

  it("only returns discounted items when onSale is set", () => {
    const list = [make({ price: 10, compareAtPrice: 20 }), make({ price: 10, compareAtPrice: null })];
    expect(queryProducts(list, { onSale: true }).total).toBe(1);
  });

  it("ranks by relevance when searching without explicit sort", () => {
    const r = queryProducts(SEED_PRODUCTS, { search: "iphone" });
    expect(r.items[0]!.title.toLowerCase()).toContain("iphone");
  });
});

describe("sortProducts", () => {
  const list = [make({ price: 30, rating: 3 }), make({ price: 10, rating: 5 }), make({ price: 20, rating: 4 })];

  it("sorts by price both directions without mutating input", () => {
    expect(sortProducts(list, "price-asc").map((p) => p.price)).toEqual([10, 20, 30]);
    expect(sortProducts(list, "price-desc").map((p) => p.price)).toEqual([30, 20, 10]);
    expect(list.map((p) => p.price)).toEqual([30, 10, 20]);
  });

  it("sorts by rating", () => {
    expect(sortProducts(list, "rating").map((p) => p.rating)).toEqual([5, 4, 3]);
  });
});

describe("facets & related", () => {
  it("computes brand counts and price range for a category", () => {
    const f = getFacets(SEED_PRODUCTS, "laptops");
    expect(f.brands.reduce((n, b) => n + b.count, 0)).toBe(SEED_PRODUCTS.filter((p) => p.category === "laptops").length);
    expect(f.priceRange.max).toBeGreaterThanOrEqual(f.priceRange.min);
  });

  it("related products never include the product itself", () => {
    const p = SEED_PRODUCTS[5]!;
    const related = getRelatedProducts(SEED_PRODUCTS, p);
    expect(related.some((r) => r.id === p.id)).toBe(false);
    expect(related[0]!.category).toBe(p.category);
  });
});
