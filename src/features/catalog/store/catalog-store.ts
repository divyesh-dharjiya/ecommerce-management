"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/data";
import { persistOptions } from "@/lib/storage";
import { createId, slugify } from "@/lib/utils";
import type { Category, Product } from "@/types";
import { inferDeletions, mergeCatalog, type PersistedCatalog } from "@/features/catalog/services/merge";
import type { CategoryDraft, ProductDraft } from "@/features/catalog/services/validation";

interface CatalogState extends PersistedCatalog {
  addProduct: (draft: ProductDraft) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProducts: (ids: string[]) => void;
  /** Applies a stock delta (negative to decrement). Clamps at zero. */
  adjustStock: (deltas: Record<string, number>) => void;
  recordSales: (sold: Record<string, number>) => void;
  /** Undoes `recordSales` (a cancelled order): stock goes back, sold counts come down. */
  reverseSales: (sold: Record<string, number>) => void;
  addCategory: (draft: CategoryDraft) => Category;
  updateCategory: (id: string, patch: Partial<CategoryDraft>) => void;
  /** Deletes a category and moves its products into `reassignTo`. */
  deleteCategory: (id: string, reassignTo?: string) => void;
  resetCatalog: () => void;
}

const SEED_PRODUCT_IDS = new Set(SEED_PRODUCTS.map((p) => p.id));
const SEED_CATEGORY_IDS = new Set(SEED_CATEGORIES.map((c) => c.id));

const uniqueSlug = (base: string, taken: Set<string>) => {
  let slug = base || "item";
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
};

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      products: SEED_PRODUCTS,
      categories: SEED_CATEGORIES,
      deletedSeedProductIds: [],
      deletedSeedCategoryIds: [],

      addProduct: (draft) => {
        const taken = new Set(get().products.map((p) => p.slug));
        const product: Product = {
          ...draft,
          id: createId("prd"),
          sku: `LX-${draft.category.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
          slug: uniqueSlug(slugify(draft.title), taken),
          images: [draft.thumbnail],
          rating: 0,
          reviewCount: 0,
          reviews: [],
          soldCount: 0,
          isNew: true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ products: [product, ...s.products] }));
        return product;
      },

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== id) return p;
            const next = { ...p, ...patch };
            if (patch.thumbnail && !p.images.includes(patch.thumbnail)) {
              next.images = [patch.thumbnail, ...p.images.filter((i) => i !== p.thumbnail)];
            }
            return next;
          }),
        })),

      deleteProducts: (ids) => {
        const remove = new Set(ids);
        set((s) => ({
          products: s.products.filter((p) => !remove.has(p.id)),
          deletedSeedProductIds: [
            ...new Set([...s.deletedSeedProductIds, ...ids.filter((id) => SEED_PRODUCT_IDS.has(id))]),
          ],
        }));
      },

      adjustStock: (deltas) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id in deltas ? { ...p, stock: Math.max(0, p.stock + (deltas[p.id] ?? 0)) } : p,
          ),
        })),

      recordSales: (sold) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id in sold
              ? {
                  ...p,
                  stock: Math.max(0, p.stock - (sold[p.id] ?? 0)),
                  soldCount: p.soldCount + (sold[p.id] ?? 0),
                }
              : p,
          ),
        })),

      reverseSales: (sold) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id in sold
              ? {
                  ...p,
                  stock: p.stock + (sold[p.id] ?? 0),
                  soldCount: Math.max(0, p.soldCount - (sold[p.id] ?? 0)),
                }
              : p,
          ),
        })),

      addCategory: (draft) => {
        const taken = new Set(get().categories.map((c) => c.slug));
        const slug = uniqueSlug(slugify(draft.name), taken);
        const category: Category = { ...draft, id: `cat_${slug}`, slug };
        set((s) => ({ categories: [...s.categories, category] }));
        return category;
      },

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCategory: (id, reassignTo) =>
        set((s) => {
          const target = s.categories.find((c) => c.id === id);
          if (!target) return s;
          const removedProducts = reassignTo
            ? []
            : s.products.filter((p) => p.category === target.slug).map((p) => p.id);
          return {
            deletedSeedCategoryIds: SEED_CATEGORY_IDS.has(id)
              ? [...new Set([...s.deletedSeedCategoryIds, id])]
              : s.deletedSeedCategoryIds,
            deletedSeedProductIds: [
              ...new Set([...s.deletedSeedProductIds, ...removedProducts.filter((pid) => SEED_PRODUCT_IDS.has(pid))]),
            ],
            categories: s.categories.filter((c) => c.id !== id),
            products: reassignTo
              ? s.products.map((p) => (p.category === target.slug ? { ...p, category: reassignTo } : p))
              : s.products.filter((p) => p.category !== target.slug),
          };
        }),

      resetCatalog: () =>
        set({
          products: SEED_PRODUCTS,
          categories: SEED_CATEGORIES,
          deletedSeedProductIds: [],
          deletedSeedCategoryIds: [],
        }),
    }),
    persistOptions<CatalogState>("catalog", {
      // v2: records deleted seed items so new seed products can be merged in safely.
      version: 2,
      partialize: (s) => ({
        products: s.products,
        categories: s.categories,
        deletedSeedProductIds: s.deletedSeedProductIds,
        deletedSeedCategoryIds: s.deletedSeedCategoryIds,
      }),
      migrate: (persisted, version) => {
        const saved = persisted as Partial<PersistedCatalog>;
        return version < 2 ? { ...saved, ...inferDeletions(saved, SEED_PRODUCTS, SEED_CATEGORIES) } : saved;
      },
      // Saved data wins, but seed items this device has never seen are added.
      merge: (persisted, current) => ({
        ...current,
        ...mergeCatalog(persisted as Partial<PersistedCatalog> | undefined, SEED_PRODUCTS, SEED_CATEGORIES),
      }),
    }),
  ),
);

// ── Selectors ────────────────────────────────────────────────────────────────
export const useProduct = (id: string | undefined) =>
  useCatalogStore((s) => (id ? s.products.find((p) => p.id === id) : undefined));
export const useProductBySlug = (slug: string) => useCatalogStore((s) => s.products.find((p) => p.slug === slug));
export const useCategoryBySlug = (slug: string) => useCatalogStore((s) => s.categories.find((c) => c.slug === slug));
