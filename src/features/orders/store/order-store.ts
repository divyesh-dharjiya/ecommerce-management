"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { liveConfig } from "@/config/site";
import { findCoupon } from "@/config/coupons";
import { persistOptions } from "@/lib/storage";
import { createId } from "@/lib/utils";
import { calculateTotals, couponApplies } from "@/features/cart/services/pricing";
import { generateHistoricalOrders } from "@/features/live/services/simulation";
import { advanceFulfilment, restockFor, transition } from "@/features/orders/services/workflow";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import type { CustomerDetails, Order, OrderLine, OrderStatus, PaymentMethod } from "@/types";

interface PlaceOrderInput {
  lines: OrderLine[];
  customer: CustomerDetails;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
}

interface OrderState {
  orders: Order[];
  seeded: boolean;
  placeOrder: (input: PlaceOrderInput) => Order;
  ingestLiveOrder: (order: Order) => void;
  /**
   * Moves an order along the workflow (see services/workflow). Cancelling puts
   * the stock back. Returns false for a move the workflow forbids.
   */
  updateStatus: (id: string, status: OrderStatus, note?: string) => boolean;
  /** Simulated warehouse step for live orders. */
  advanceLiveOrders: () => void;
  seedHistory: () => void;
  reset: () => void;
}

const nextOrderNumber = (orders: Order[]) => {
  const taken = new Set(orders.map((o) => o.number));
  let n: string;
  do n = `LX-${Math.floor(100000 + Math.random() * 900000)}`;
  while (taken.has(n));
  return n;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      seeded: false,

      placeOrder: ({ lines, customer, paymentMethod, couponCode }) => {
        // Totals are recomputed here — never trust numbers passed from the UI.
        const coupon = couponCode ? findCoupon(couponCode) : undefined;
        const totals = calculateTotals(lines, coupon);
        // A coupon below its minimum spend gave no discount, so it isn't recorded on the order.
        const appliedCoupon = couponApplies(coupon, totals.subtotal) ? coupon : null;
        const status = paymentMethod === "cod" ? "pending" : "processing";
        const createdAt = new Date().toISOString();
        const order: Order = {
          id: createId("ord"),
          number: nextOrderNumber(get().orders),
          lines,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          couponCode: appliedCoupon?.code ?? null,
          status,
          customer,
          paymentMethod,
          source: "web",
          createdAt,
          history: [{ status, at: createdAt }],
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        useCatalogStore.getState().recordSales(Object.fromEntries(lines.map((l) => [l.productId, l.quantity])));
        return order;
      },

      ingestLiveOrder: (order) =>
        set((s) => {
          // Cap simulated orders so localStorage doesn't grow unbounded.
          let liveSeen = 0;
          const trimmed = s.orders.filter((o) => o.source !== "live" || ++liveSeen < liveConfig.maxLiveOrders);
          return { orders: [order, ...trimmed] };
        }),

      updateStatus: (id, status, note) => {
        const order = get().orders.find((o) => o.id === id);
        const next = order && transition(order, status, undefined, note);
        if (!next) return false;
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? next : o)) }));
        if (status === "cancelled") useCatalogStore.getState().reverseSales(restockFor(next));
        return true;
      },

      advanceLiveOrders: () => {
        const { orders } = get();
        const next = advanceFulfilment(orders);
        if (next.some((o, i) => o !== orders[i])) set({ orders: next });
      },

      seedHistory: () => {
        if (get().seeded) return;
        const history = generateHistoricalOrders(useCatalogStore.getState().products);
        set((s) => ({ orders: [...s.orders, ...history], seeded: true }));
      },

      reset: () => set({ orders: [], seeded: false }),
    }),
    persistOptions<OrderState>("orders", {
      version: 1,
      partialize: (s) => ({ orders: s.orders, seeded: s.seeded }),
    }),
  ),
);
