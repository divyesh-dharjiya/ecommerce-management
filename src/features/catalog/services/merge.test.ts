import { describe, expect, it } from "vitest";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/data";
import { inferDeletions, mergeCatalog } from "@/features/catalog/services/merge";

const seed = SEED_PRODUCTS.slice(0, 10);
const cats = SEED_CATEGORIES.slice(0, 4);

describe("mergeCatalog", () => {
  it("returns the seed for a brand-new device", () => {
    const m = mergeCatalog(undefined, seed, cats);
    expect(m.products).toHaveLength(10);
    expect(m.categories).toHaveLength(4);
  });

  it("adds seed products a returning device has never seen", () => {
    const saved = {
      products: seed.slice(0, 6),
      categories: cats,
      deletedSeedProductIds: [],
      deletedSeedCategoryIds: [],
    };
    const m = mergeCatalog(saved, seed, cats);
    expect(m.products.map((p) => p.id)).toEqual(seed.map((p) => p.id));
  });

  it("preserves admin edits and live stock over the seed", () => {
    const edited = { ...seed[0]!, price: 1, stock: 3, title: "Edited" };
    const m = mergeCatalog(
      { products: [edited], categories: cats, deletedSeedProductIds: [], deletedSeedCategoryIds: [] },
      seed,
      cats,
    );
    expect(m.products.find((p) => p.id === edited.id)).toMatchObject({ price: 1, stock: 3, title: "Edited" });
  });

  it("does not resurrect products the admin deleted", () => {
    const deleted = seed[2]!.id;
    const saved = {
      products: seed.filter((p) => p.id !== deleted),
      categories: cats,
      deletedSeedProductIds: [deleted],
      deletedSeedCategoryIds: [],
    };
    expect(mergeCatalog(saved, seed, cats).products.some((p) => p.id === deleted)).toBe(false);
  });

  it("keeps admin-created products that are not in the seed", () => {
    const custom = { ...seed[0]!, id: "prd_custom", slug: "custom" };
    const m = mergeCatalog(
      { products: [custom, ...seed], categories: cats, deletedSeedProductIds: [], deletedSeedCategoryIds: [] },
      seed,
      cats,
    );
    expect(m.products.filter((p) => p.id === "prd_custom")).toHaveLength(1);
  });
});

describe("inferDeletions (v1 migration)", () => {
  it("treats seed items missing from saved data as deleted", () => {
    const d = inferDeletions({ products: seed.slice(1), categories: cats.slice(0, 3) }, seed, cats);
    expect(d.deletedSeedProductIds).toEqual([seed[0]!.id]);
    expect(d.deletedSeedCategoryIds).toEqual([cats[3]!.id]);
  });
});
