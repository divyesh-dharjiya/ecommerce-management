import { describe, expect, it } from "vitest";
import {
  advanceFulfilment,
  canTransition,
  isCancellable,
  restockFor,
  transition,
} from "@/features/orders/services/workflow";
import type { Order, OrderStatus } from "@/types";

const order = (status: OrderStatus, extra: Partial<Order> = {}): Order =>
  ({
    id: "o1",
    number: "LX-1",
    status,
    source: "web",
    createdAt: "2026-01-01T00:00:00.000Z",
    lines: [
      { productId: "a", quantity: 2 },
      { productId: "b", quantity: 1 },
    ],
    ...extra,
  }) as Order;

describe("order workflow", () => {
  it("only moves forward, and cancels until shipped", () => {
    expect(canTransition("pending", "processing")).toBe(true);
    expect(canTransition("processing", "shipped")).toBe(true);
    expect(canTransition("delivered", "pending")).toBe(false);
    expect(canTransition("cancelled", "processing")).toBe(false);
    expect(isCancellable(order("processing"))).toBe(true);
    expect(isCancellable(order("shipped"))).toBe(false);
  });

  it("records each change in the history", () => {
    const next = transition(order("pending"), "cancelled", "2026-01-02T00:00:00.000Z", "Changed my mind")!;
    expect(next.status).toBe("cancelled");
    expect(next.history).toEqual([
      { status: "pending", at: "2026-01-01T00:00:00.000Z" },
      { status: "cancelled", at: "2026-01-02T00:00:00.000Z", note: "Changed my mind" },
    ]);
    expect(transition(next, "processing")).toBeNull();
  });

  it("restocks shopper and live orders but not historical demo orders", () => {
    expect(restockFor(order("pending"))).toEqual({ a: 2, b: 1 });
    expect(restockFor(order("pending", { source: "seed" }))).toEqual({});
  });
});

describe("advanceFulfilment", () => {
  const created = Date.parse("2026-01-01T00:00:00.000Z");

  it("moves waiting live orders one step and leaves shopper orders alone", () => {
    const orders = [order("pending", { source: "live" }), order("pending", { id: "o2" })];
    const [live, web] = advanceFulfilment(orders, created + 60_000);
    expect(live!.status).toBe("processing");
    expect(web).toBe(orders[1]);
  });

  it("waits for the delay and respects the per-call limit", () => {
    const live = (id: string) => order("pending", { id, source: "live" });
    expect(advanceFulfilment([live("x")], created + 1_000)[0]!.status).toBe("pending");
    const moved = advanceFulfilment([live("x"), live("y"), live("z")], created + 60_000, 2);
    expect(moved.map((o) => o.status)).toEqual(["processing", "processing", "pending"]);
  });
});
