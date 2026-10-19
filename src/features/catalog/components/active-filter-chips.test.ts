import { describe, expect, it } from "vitest";
import { filterChips } from "@/features/catalog/components/active-filter-chips";
import { SEED_CATEGORIES } from "@/data";

describe("filterChips", () => {
  it("creates one removable chip per active filter", () => {
    const chips = filterChips(
      { category: "laptops", brands: ["Apple", "Dell"], minPrice: 100, onSale: true },
      SEED_CATEGORIES,
    );
    expect(chips.map((c) => c.label)).toEqual(["Laptops", "Apple", "Dell", "$100 – any", "On sale"]);
    expect(chips[1]!.clear).toEqual({ brands: ["Dell"] });
  });

  it("omits the category chip when the route locks the category", () => {
    expect(filterChips({ category: "laptops" }, SEED_CATEGORIES, "laptops")).toHaveLength(0);
  });
});
