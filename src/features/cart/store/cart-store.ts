"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commerceConfig } from "@/config/site";
import { findCoupon } from "@/config/coupons";
import { persistOptions } from "@/lib/storage";
import { calculateTotals } from "@/features/cart/services/pricing";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import type { CartItem, CartTotals, Coupon, Product } from "@/types";

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  /** Adds quantity and returns the quantity actually added after stock/limit clamping. */
  addItem: (product: Product, quantity?: number) => number;
  setQuantity: (productId: string, quantity: number, maxStock: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  applyCoupon: (code: string | null) => void;
}

const maxFor = (stock: number) => Math.min(stock, commerceConfig.maxQuantityPerItem);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,

      addItem: (product, quantity = 1) => {
        const existing = get().items.find((i) => i.productId === product.id);
        const current = existing?.quantity ?? 0;
        const next = Math.min(current + quantity, maxFor(product.stock));
        const added = Math.max(0, next - current);
        if (added === 0) return 0;
        set((s) => ({
          items: existing
            ? s.items.map((i) => (i.productId === product.id ? { ...i, quantity: next } : i))
            : [...s.items, { productId: product.id, quantity: next, addedAt: new Date().toISOString() }],
        }));
        return added;
      },

      setQuantity: (productId, quantity, maxStock) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(quantity, maxFor(maxStock)) }
                    : i,
                ),
        })),

      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      clear: () => set({ items: [], couponCode: null }),

      applyCoupon: (code) => set({ couponCode: code ? code.toUpperCase() : null }),
    }),
    persistOptions<CartState>("cart", {
      version: 1,
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode }),
    }),
  ),
);

export interface CartLine {
  item: CartItem;
  product: Product;
}

/**
 * Joins cart items with live catalog data so prices and stock are always
 * current (a product deleted by an admin silently drops out of the cart view).
 */
export function useCartLines(): CartLine[] {
  const items = useCartStore((s) => s.items);
  const products = useCatalogStore((s) => s.products);
  return useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return items.flatMap((item) => {
      const product = byId.get(item.productId);
      return product && product.status === "active" ? [{ item, product }] : [];
    });
  }, [items, products]);
}

export function useCartSummary(): { lines: CartLine[]; totals: CartTotals; coupon: Coupon | null } {
  const lines = useCartLines();
  const couponCode = useCartStore((s) => s.couponCode);
  return useMemo(() => {
    const coupon = couponCode ? (findCoupon(couponCode) ?? null) : null;
    const totals = calculateTotals(
      lines.map(({ item, product }) => ({ unitPrice: product.price, quantity: item.quantity })),
      coupon,
    );
    return { lines, totals, coupon };
  }, [lines, couponCode]);
}

export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
