"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions } from "@/lib/storage";

interface WishlistState {
  ids: string[];
  /** Returns true when the product is now in the wishlist. */
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const has = get().ids.includes(productId);
        set((s) => ({ ids: has ? s.ids.filter((id) => id !== productId) : [productId, ...s.ids] }));
        return !has;
      },
      remove: (productId) => set((s) => ({ ids: s.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
    }),
    persistOptions<WishlistState>("wishlist", { version: 1, partialize: (s) => ({ ids: s.ids }) }),
  ),
);

export const useIsWishlisted = (productId: string) =>
  useWishlistStore((s) => s.ids.includes(productId));
