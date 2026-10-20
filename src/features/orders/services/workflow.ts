import type { Order, OrderStatus } from "@/types";

/**
 * Order lifecycle. Orders only move forward; cancelling is possible until the
 * parcel ships. Delivered and cancelled are final.
 */
export const NEXT_STATUSES: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) => NEXT_STATUSES[from].includes(to);

export const isCancellable = (order: Pick<Order, "status">) => canTransition(order.status, "cancelled");

/** When the order last changed status (orders saved before history existed fall back to creation). */
export const lastStatusAt = (order: Order) => order.history?.at(-1)?.at ?? order.createdAt;

/** When the order reached `status`, if it is recorded. */
export const reachedAt = (order: Order, status: OrderStatus) => order.history?.find((h) => h.status === status)?.at;

/** Applies a status change, appending it to the history. Returns null for a move the workflow forbids. */
export function transition(order: Order, to: OrderStatus, at = new Date().toISOString(), note?: string): Order | null {
  if (!canTransition(order.status, to)) return null;
  const history = order.history ?? [{ status: order.status, at: order.createdAt }];
  return { ...order, status: to, history: [...history, { status: to, at, ...(note ? { note } : {}) }] };
}

/**
 * Stock to put back when an order is cancelled. Historical demo orders never
 * took stock, so they return nothing.
 */
export function restockFor(order: Order): Record<string, number> {
  if (order.source === "seed") return {};
  const deltas: Record<string, number> = {};
  for (const l of order.lines) deltas[l.productId] = (deltas[l.productId] ?? 0) + l.quantity;
  return deltas;
}

/** How long a simulated order waits in each status before the warehouse moves it on. */
export const FULFILMENT_DELAY_MS: Partial<Record<OrderStatus, number>> = {
  pending: 30_000,
  processing: 2 * 60_000,
  shipped: 5 * 60_000,
};

const FORWARD: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
};

/**
 * Simulated warehouse: advances live (simulated) orders that have waited long
 * enough, at most `limit` per call, so the admin sees orders flow through the
 * pipeline instead of piling up as "pending". Shoppers' own orders are left to
 * the admin.
 */
export function advanceFulfilment(orders: Order[], now = Date.now(), limit = 2): Order[] {
  let moved = 0;
  return orders.map((o) => {
    if (moved >= limit || o.source !== "live") return o;
    const next = FORWARD[o.status];
    const delay = FULFILMENT_DELAY_MS[o.status];
    if (!next || delay === undefined || now - Date.parse(lastStatusAt(o)) < delay) return o;
    moved++;
    return transition(o, next, new Date(now).toISOString()) ?? o;
  });
}
