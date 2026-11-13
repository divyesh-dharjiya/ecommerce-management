"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions } from "@/lib/storage";
import { createId } from "@/lib/utils";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { withNewRating, type ReviewDraft } from "@/features/reviews/services/reviews";
import type { Product, Review } from "@/types";

interface ReviewState {
  /** Reviews written on this device, newest first, keyed by product id. */
  byProduct: Record<string, Review[]>;
  /** Saves a review and folds its stars into the product's rating. */
  addReview: (product: Product, draft: ReviewDraft, verified: boolean) => Review;
  reset: () => void;
}

const NONE: Review[] = [];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      byProduct: {},

      addReview: (product, draft, verified) => {
        const review: Review = {
          id: createId("rev"),
          author: draft.author.trim(),
          rating: draft.rating,
          comment: draft.comment.trim(),
          date: new Date().toISOString(),
          verified,
          own: true,
        };
        set((s) => ({ byProduct: { ...s.byProduct, [product.id]: [review, ...(s.byProduct[product.id] ?? [])] } }));
        const current = useCatalogStore.getState().products.find((p) => p.id === product.id) ?? product;
        useCatalogStore.getState().updateProduct(product.id, withNewRating(current, draft.rating));
        return review;
      },

      reset: () => set({ byProduct: {} }),
    }),
    persistOptions<ReviewState>("reviews", { version: 1, partialize: (s) => ({ byProduct: s.byProduct }) }),
  ),
);

export const useOwnReviews = (productId: string) => useReviewStore((s) => s.byProduct[productId] ?? NONE);
