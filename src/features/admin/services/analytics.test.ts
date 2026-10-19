import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "@/data";
import {
  getCategoryBreakdown,
  getDailySeries,
  getKpis,
  getLiveSeries,
  getTopProducts,
} from "@/features/admin/services/analytics";
import { generateHistoricalOrders, simulatePurchase } from "@/features/live/services/simulation";
import { mulberry32 } from "@/lib/utils";
import type { Order } from "@/types";

const NOW = Date.UTC(2026, 9, 7, 12);
const orders = generateHistoricalOrders(SEED_PRODUCTS, { now: NOW, days: 60, seed: 1 });

describe("generateHistoricalOrders", () => {
  it("produces orders within the window, newest first", () => {
    expect(orders.length).toBeGreaterThan(100);
    expect(Date.parse(orders[0]!.createdAt)).toBeLessThanOrEqual(NOW);
    expect(orders[0]!.createdAt >= orders.at(-1)!.createdAt).toBe(true);
  });

  it("order totals equal the sum of their parts", () => {
    for (const o of orders.slice(0, 50)) {
      expect(o.total).toBeCloseTo(o.subtotal - o.discount + o.shipping + o.tax, 2);
    }
  });
});

describe("getKpis", () => {
  it("excludes cancelled orders from revenue", () => {
    const one = {
      ...orders[0]!,
      createdAt: new Date(NOW - 1000).toISOString(),
      total: 100,
      status: "delivered",
    } as Order;
    const cancelled = { ...one, id: "x", total: 999, status: "cancelled" } as Order;
    const k = getKpis([one, cancelled], 30, NOW);
    expect(k.revenue.value).toBe(100);
    expect(k.orders.value).toBe(1);
    expect(k.revenue.change).toBeNull(); // no baseline
  });

  it("computes period-over-period change", () => {
    const k = getKpis(orders, 30, NOW);
    expect(k.revenue.value).toBeGreaterThan(0);
    expect(k.revenue.change).not.toBeNull();
  });
});

describe("series", () => {
  it("daily series has one bucket per day including empty days", () => {
    expect(getDailySeries([], 14, NOW)).toHaveLength(14);
    const s = getDailySeries(orders, 30, NOW);
    expect(s.reduce((n, p) => n + p.orders, 0)).toBeGreaterThan(0);
  });

  it("live series buckets recent orders per minute", () => {
    const o = { ...orders[0]!, createdAt: new Date(NOW - 30_000).toISOString(), status: "pending", total: 42 } as Order;
    const s = getLiveSeries([o], 20, NOW);
    expect(s).toHaveLength(20);
    expect(s.reduce((n, p) => n + p.revenue, 0)).toBe(42);
  });

  it("category breakdown folds the tail into 'other'", () => {
    const b = getCategoryBreakdown(orders, 5);
    expect(b).toHaveLength(5);
    expect(b.at(-1)!.category).toBe("other");
  });

  it("top products are sorted by revenue", () => {
    const t = getTopProducts(orders, 5);
    expect(t[0]!.revenue).toBeGreaterThanOrEqual(t[1]!.revenue);
  });
});

describe("simulatePurchase", () => {
  it("never sells more than available stock", () => {
    const products = SEED_PRODUCTS.map((p) => ({ ...p, stock: 1 }));
    const r = simulatePurchase(products, mulberry32(3));
    expect(r).not.toBeNull();
    for (const l of r!.order.lines) expect(l.quantity).toBeLessThanOrEqual(1);
  });

  it("returns null when everything is sold out", () => {
    expect(simulatePurchase(SEED_PRODUCTS.map((p) => ({ ...p, stock: 0 })))).toBeNull();
  });
});
