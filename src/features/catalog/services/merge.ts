import type { Category, Product } from "@/types";

/** The slice of the catalog that is persisted per device. */
export interface PersistedCatalog {
  products: Product[];
  categories: Category[];
  /** Seed products the admin deleted — they must not reappear when the seed grows. */
  deletedSeedProductIds: string[];
  deletedSeedCategoryIds: string[];
}

/**
 * Reconciles a device's saved catalog with the current seed.
 *
 * Saved data wins (admin edits, live stock, sold counts are preserved), but
 * seed items the device has never seen — and the admin hasn't deleted — are
 * added. Without this, a returning visitor would be stuck on whatever
 * catalog they first loaded and never receive new products.
 */
export function mergeCatalog(
  saved: Partial<PersistedCatalog> | undefined,
  seedProducts: Product[],
  seedCategories: Category[],
): PersistedCatalog {
  const products = saved?.products ?? seedProducts;
  const categories = saved?.categories ?? seedCategories;
  const deletedSeedProductIds = saved?.deletedSeedProductIds ?? [];
  const deletedSeedCategoryIds = saved?.deletedSeedCategoryIds ?? [];

  const haveProducts = new Set(products.map((p) => p.id));
  const haveCategories = new Set(categories.map((c) => c.id));
  const skipProducts = new Set(deletedSeedProductIds);
  const skipCategories = new Set(deletedSeedCategoryIds);

  return {
    products: [...products, ...seedProducts.filter((p) => !haveProducts.has(p.id) && !skipProducts.has(p.id))],
    categories: [
      ...categories,
      ...seedCategories.filter((c) => !haveCategories.has(c.id) && !skipCategories.has(c.id)),
    ],
    deletedSeedProductIds,
    deletedSeedCategoryIds,
  };
}

/** v1 saved no deletion record; infer it: seed items missing from the saved catalog were deleted. */
export function inferDeletions(
  saved: { products?: Product[]; categories?: Category[] },
  seedProducts: Product[],
  seedCategories: Category[],
) {
  const haveP = new Set((saved.products ?? []).map((p) => p.id));
  const haveC = new Set((saved.categories ?? []).map((c) => c.id));
  return {
    deletedSeedProductIds: seedProducts.filter((p) => !haveP.has(p.id)).map((p) => p.id),
    deletedSeedCategoryIds: seedCategories.filter((c) => !haveC.has(c.id)).map((c) => c.id),
  };
}
