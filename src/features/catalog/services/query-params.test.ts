import { describe, expect, it } from "vitest";
import { countActiveFilters, parseProductQuery, serializeProductQuery } from "@/features/catalog/services/query-params";
import { pageWindow } from "@/components/ui";
import { validateProduct } from "@/features/catalog/services/validation";
import { validateCustomer } from "@/features/checkout/services/validation";
import { SEED_CATEGORIES } from "@/data";

describe("product query params", () => {
  it("round-trips through the URL", () => {
    const q = {
      search: "watch",
      category: "mens-watches",
      brands: ["Rolex", "Longines"],
      minPrice: 100,
      maxPrice: 5000,
      minRating: 4,
      inStock: true,
      onSale: true,
      sort: "price-asc" as const,
      page: 2,
    };
    expect(parseProductQuery(new URLSearchParams(serializeProductQuery(q)))).toEqual(q);
  });

  it("drops invalid values instead of throwing", () => {
    const q = parseProductQuery(new URLSearchParams("min=abc&max=-5&sort=hack&page=0"));
    expect(q.minPrice).toBeUndefined();
    expect(q.maxPrice).toBeUndefined();
    expect(q.sort).toBeUndefined();
    expect(q.page).toBeUndefined();
  });

  it("omits defaults from the serialised URL", () => {
    expect(serializeProductQuery({ sort: "featured", page: 1 })).toBe("");
  });

  it("counts active filters, ignoring a route-locked category", () => {
    expect(countActiveFilters({ category: "laptops", brands: ["Apple"], inStock: true }, "laptops")).toBe(2);
  });
});

describe("pageWindow", () => {
  it("shows all pages when few", () => expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]));
  it("adds ellipses around the current page", () => expect(pageWindow(6, 12)).toEqual([1, "…", 5, 6, 7, "…", 12]));
});

describe("validation", () => {
  it("flags every missing checkout field", () => {
    const e = validateCustomer({
      fullName: "",
      email: "bad",
      phone: "1",
      address: "",
      city: "",
      postalCode: "!",
      country: "",
    });
    expect(Object.keys(e).sort()).toEqual(["address", "city", "country", "email", "fullName", "phone", "postalCode"]);
  });

  it("accepts a valid customer", () => {
    expect(
      validateCustomer({
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: "+1 555 0100",
        address: "1 Market St",
        city: "Austin",
        postalCode: "73301",
        country: "United States",
      }),
    ).toEqual({});
  });

  it("rejects compare-at price lower than price", () => {
    const e = validateProduct(
      {
        title: "Desk",
        description: "A sturdy desk",
        brand: "Acme",
        category: SEED_CATEGORIES[0]!.slug,
        price: 100,
        compareAtPrice: 80,
        stock: 5,
        thumbnail: "https://x.com/a.png",
        status: "active",
        tags: [],
        isFeatured: false,
      },
      SEED_CATEGORIES,
    );
    expect(e.compareAtPrice).toBeDefined();
    expect(Object.keys(e)).toHaveLength(1);
  });
});

describe("formatRelativeTime", () => {
  it("never shows sub-minute times in the future", async () => {
    const { formatRelativeTime } = await import("@/lib/format");
    const now = Date.now();
    expect(formatRelativeTime(new Date(now + 3000).toISOString(), now)).toBe("just now");
    expect(formatRelativeTime(new Date(now - 5 * 60_000).toISOString(), now)).toBe("5 minutes ago");
  });
});
