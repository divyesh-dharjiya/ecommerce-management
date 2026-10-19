import { round2 } from "@/lib/utils";
import type { Order, Product } from "@/types";

const DAY = 86_400_000;
const MINUTE = 60_000;

const isRevenue = (o: Order) => o.status !== "cancelled";

export interface KpiValue {
  value: number;
  previous: number;
  /** Percentage change vs previous period; null when there is no baseline. */
  change: number | null;
}

export interface Kpis {
  revenue: KpiValue;
  orders: KpiValue;
  averageOrderValue: KpiValue;
  customers: KpiValue;
  unitsSold: KpiValue;
}

const pctChange = (value: number, previous: number) =>
  previous === 0 ? null : round2(((value - previous) / previous) * 100);

function summarise(orders: Order[]) {
  const valid = orders.filter(isRevenue);
  const revenue = round2(valid.reduce((s, o) => s + o.total, 0));
  const units = valid.reduce((s, o) => s + o.lines.reduce((n, l) => n + l.quantity, 0), 0);
  const customers = new Set(valid.map((o) => o.customer.email)).size;
  return {
    revenue,
    orders: valid.length,
    aov: valid.length ? round2(revenue / valid.length) : 0,
    customers,
    units,
  };
}

/** KPIs for the trailing window compared with the window immediately before it. */
export function getKpis(orders: Order[], days = 30, now = Date.now()): Kpis {
  const start = now - days * DAY;
  const prevStart = start - days * DAY;
  const current = summarise(orders.filter((o) => Date.parse(o.createdAt) >= start));
  const previous = summarise(
    orders.filter((o) => {
      const t = Date.parse(o.createdAt);
      return t >= prevStart && t < start;
    }),
  );
  const kpi = (v: number, p: number): KpiValue => ({ value: v, previous: p, change: pctChange(v, p) });
  return {
    revenue: kpi(current.revenue, previous.revenue),
    orders: kpi(current.orders, previous.orders),
    averageOrderValue: kpi(current.aov, previous.aov),
    customers: kpi(current.customers, previous.customers),
    unitsSold: kpi(current.units, previous.units),
  };
}

export interface SeriesPoint {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

/** Daily revenue buckets for the trailing `days`, oldest first, including empty days. */
export function getDailySeries(orders: Order[], days = 30, now = Date.now()): SeriesPoint[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const buckets = new Map<string, SeriesPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: 0,
      orders: 0,
    });
  }
  for (const o of orders) {
    if (!isRevenue(o)) continue;
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const bucket = buckets.get(d.toISOString().slice(0, 10));
    if (!bucket) continue;
    bucket.revenue = round2(bucket.revenue + o.total);
    bucket.orders += 1;
  }
  return [...buckets.values()];
}

/** Per-minute revenue for the trailing `minutes` — powers the realtime chart. */
export function getLiveSeries(orders: Order[], minutes = 20, now = Date.now()): SeriesPoint[] {
  const end = Math.floor(now / MINUTE) * MINUTE;
  const points: SeriesPoint[] = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const t = end - i * MINUTE;
    points.push({
      key: String(t),
      label: new Date(t).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      revenue: 0,
      orders: 0,
    });
  }
  const first = end - (minutes - 1) * MINUTE;
  for (const o of orders) {
    if (!isRevenue(o)) continue;
    const t = Date.parse(o.createdAt);
    if (t < first) continue;
    const idx = Math.floor((t - first) / MINUTE);
    const point = points[idx];
    if (!point) continue;
    point.revenue = round2(point.revenue + o.total);
    point.orders += 1;
  }
  return points;
}

export interface CategoryShare {
  category: string;
  revenue: number;
  units: number;
}

export function getCategoryBreakdown(orders: Order[], limit = 6): CategoryShare[] {
  const map = new Map<string, CategoryShare>();
  for (const o of orders) {
    if (!isRevenue(o)) continue;
    for (const l of o.lines) {
      const entry = map.get(l.category) ?? { category: l.category, revenue: 0, units: 0 };
      entry.revenue = round2(entry.revenue + l.unitPrice * l.quantity);
      entry.units += l.quantity;
      map.set(l.category, entry);
    }
  }
  const sorted = [...map.values()].sort((a, b) => b.revenue - a.revenue);
  if (sorted.length <= limit) return sorted;
  const head = sorted.slice(0, limit - 1);
  const rest = sorted.slice(limit - 1);
  head.push({
    category: "other",
    revenue: round2(rest.reduce((s, c) => s + c.revenue, 0)),
    units: rest.reduce((s, c) => s + c.units, 0),
  });
  return head;
}

export interface TopProduct {
  productId: string;
  title: string;
  thumbnail: string;
  revenue: number;
  units: number;
}

export function getTopProducts(orders: Order[], limit = 5): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const o of orders) {
    if (!isRevenue(o)) continue;
    for (const l of o.lines) {
      const entry = map.get(l.productId) ?? {
        productId: l.productId,
        title: l.title,
        thumbnail: l.thumbnail,
        revenue: 0,
        units: 0,
      };
      entry.revenue = round2(entry.revenue + l.unitPrice * l.quantity);
      entry.units += l.quantity;
      map.set(l.productId, entry);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function getLowStock(products: Product[], threshold: number, limit = 6): Product[] {
  return products
    .filter((p) => p.status === "active" && p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

export function getInventoryValue(products: Product[]) {
  return round2(products.reduce((s, p) => s + p.price * p.stock, 0));
}
