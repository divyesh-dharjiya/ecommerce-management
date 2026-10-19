"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import { usePreferencesStore } from "@/store/preferences-store";
import { useRecentlyViewedStore } from "@/features/catalog/store/recently-viewed-store";
import { useUiStore } from "@/store/ui-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";

const PERSISTED_STORES = [
  useCatalogStore,
  useCartStore,
  useWishlistStore,
  useOrderStore,
  useRecentlyViewedStore,
  usePreferencesStore,
] as const;

/**
 * 1. Rehydrates every persisted store after mount (keeps SSR markup stable).
 * 2. Seeds demo order history on first visit.
 * 3. Live cross-tab sync — when another tab writes to localStorage, the
 *    matching store rehydrates so every open tab reflects the same data.
 */
export function StoreHydrator() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Catalog first: order seeding depends on products.
      await useCatalogStore.persist.rehydrate();
      await Promise.all(PERSISTED_STORES.slice(1).map((s) => s.persist.rehydrate()));
      if (cancelled) return;
      useOrderStore.getState().seedHistory();
      useUiStore.getState().setHydrated();
    })();

    const onStorage = (event: StorageEvent) => {
      if (!event.key) return;
      for (const store of PERSISTED_STORES) {
        if (store.persist.getOptions().name === event.key) void store.persist.rehydrate();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
