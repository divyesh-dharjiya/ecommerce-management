import { describe, expect, it } from "vitest";
import { withDetails } from "@/features/catalog/services/details";
import type { Product, ProductDetails } from "@/types";

const lite = {
  id: "p1",
  description: "A lovely product that does many…",
  images: ["a.webp", "b.webp"],
  reviews: [],
} as unknown as Product;

const details: ProductDetails = {
  description: "A lovely product that does many things very well indeed.",
  images: ["a.webp", "b.webp", "c.webp", "d.webp"],
  reviews: [{ id: "r1", author: "Ann", rating: 5, comment: "Great", date: "2026-01-01" }],
  warranty: "2 years",
};

describe("withDetails", () => {
  it("fills in fields the lite catalog leaves out", () => {
    const p = withDetails(lite, details);
    expect(p.description).toBe(details.description);
    expect(p.images).toHaveLength(4);
    expect(p.reviews).toHaveLength(1);
    expect(p.warranty).toBe("2 years");
  });

  it("never overwrites an admin-edited description", () => {
    const edited = { ...lite, description: "Rewritten by the shop owner." };
    expect(withDetails(edited, details).description).toBe("Rewritten by the shop owner.");
  });

  it("keeps stored values that are already present", () => {
    const p = withDetails({ ...lite, warranty: "Lifetime" }, details);
    expect(p.warranty).toBe("Lifetime");
  });

  it("keeps a main image the admin replaced", () => {
    const edited = {
      ...lite,
      thumbnail: "https://cdn.example/new.jpg",
      images: ["https://cdn.example/new.jpg", "b.webp"],
    };
    const p = withDetails(edited, details);
    expect(p.images[0]).toBe("https://cdn.example/new.jpg");
    expect(p.images).toHaveLength(5);
  });

  it("returns the product unchanged without details (admin-created products)", () => {
    expect(withDetails(lite, undefined)).toBe(lite);
  });
});
