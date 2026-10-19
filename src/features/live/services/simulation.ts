/**
 * Demo-data generation: historical orders for the dashboard and the realtime
 * "live shoppers" feed. Kept separate from the stores so it can be unit tested
 * and swapped for a real event source (WebSocket / SSE) without touching UI.
 */
import { calculateTotals } from "@/features/cart/services/pricing";
import { createId, mulberry32, pick } from "@/lib/utils";
import type { LiveEvent, Order, OrderLine, OrderStatus, PaymentMethod, Product } from "@/types";

const FIRST_NAMES = [
  "Aarav", "Olivia", "Liam", "Priya", "Noah", "Emma", "Mateo", "Sofia", "Kenji", "Amara",
  "Lucas", "Isla", "Arjun", "Mia", "Ethan", "Zara", "Leo", "Ananya", "Hugo", "Chloe",
  "Ravi", "Aisha", "Daniel", "Yuki", "Omar", "Elena", "Kabir", "Grace", "Diego", "Nora",
];
const LAST_NAMES = [
  "Sharma", "Johnson", "Patel", "Garcia", "Kim", "Müller", "Rossi", "Silva", "Tanaka", "Okafor",
  "Brown", "Singh", "Martin", "Lee", "Nguyen", "Cohen", "Haddad", "Wilson", "Mehta", "Dubois",
];
const CITIES: [string, string][] = [
  ["Mumbai", "India"], ["New York", "United States"], ["London", "United Kingdom"],
  ["Berlin", "Germany"], ["Tokyo", "Japan"], ["Toronto", "Canada"], ["Sydney", "Australia"],
  ["Bengaluru", "India"], ["Paris", "France"], ["Dubai", "United Arab Emirates"],
  ["San Francisco", "United States"], ["Singapore", "Singapore"], ["Amsterdam", "Netherlands"],
  ["Ahmedabad", "India"], ["Austin", "United States"], ["Madrid", "Spain"],
];
const PAYMENT: PaymentMethod[] = ["card", "card", "card", "upi", "cod"];

const orderNumber = (random: () => number) =>
  `LX-${Math.floor(100000 + random() * 900000)}`;

function buildCustomer(random: () => number) {
  const first = pick(FIRST_NAMES, random);
  const last = pick(LAST_NAMES, random);
  const [city, country] = pick(CITIES, random);
  return {
    fullName: `${first} ${last}`,
    email: `${first}.${last}${Math.floor(random() * 90) + 10}@example.com`
      .toLowerCase()
      .replace(/[^a-z0-9.@]/g, ""),
    phone: `+1 555 ${String(Math.floor(random() * 9000) + 1000)}`,
    address: `${Math.floor(random() * 900) + 10} Market Street`,
    city,
    postalCode: String(Math.floor(random() * 90000) + 10000),
    country,
  };
}

const BIG_TICKET = 2500;

/** Picks a product, re-rolling big-ticket items most of the time — real baskets skew to everyday prices. */
function pickRealistic(products: Product[], random: () => number): Product {
  let p = pick(products, random);
  for (let tries = 0; p.price >= BIG_TICKET && random() > 0.01 && tries < 12; tries++) p = pick(products, random);
  return p;
}

function buildLines(products: Product[], random: () => number, maxLines = 3): OrderLine[] {
  const count = 1 + Math.floor(random() * maxLines);
  const chosen = new Map<string, OrderLine>();
  for (let i = 0; i < count; i++) {
    const p = pickRealistic(products, random);
    const existing = chosen.get(p.id);
    if (existing) {
      existing.quantity += 1;
      continue;
    }
    chosen.set(p.id, {
      productId: p.id,
      title: p.title,
      thumbnail: p.thumbnail,
      category: p.category,
      unitPrice: p.price,
      quantity: random() > 0.8 ? 2 : 1,
    });
  }
  return [...chosen.values()];
}

function statusForAge(ageDays: number, random: () => number): OrderStatus {
  if (random() < 0.04) return "cancelled";
  if (ageDays > 7) return "delivered";
  if (ageDays > 3) return random() > 0.4 ? "delivered" : "shipped";
  if (ageDays > 1) return random() > 0.5 ? "shipped" : "processing";
  return random() > 0.5 ? "processing" : "pending";
}

function assembleOrder(
  lines: OrderLine[],
  random: () => number,
  createdAt: Date,
  status: OrderStatus,
  source: Order["source"],
): Order {
  const totals = calculateTotals(lines);
  return {
    id: createId("ord"),
    number: orderNumber(random),
    lines,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    couponCode: null,
    status,
    customer: buildCustomer(random),
    paymentMethod: pick(PAYMENT, random),
    source,
    createdAt: createdAt.toISOString(),
  };
}

/**
 * Deterministic order history across the trailing `days` with a gentle upward
 * trend and weekend bumps, so charts look like a healthy store.
 */
export function generateHistoricalOrders(
  products: Product[],
  { days = 60, now = Date.now(), seed = 42 }: { days?: number; now?: number; seed?: number } = {},
): Order[] {
  const random = mulberry32(seed);
  const active = products.filter((p) => p.status === "active");
  if (active.length === 0) return [];
  const orders: Order[] = [];
  for (let d = days; d >= 0; d--) {
    const day = new Date(now - d * 86_400_000);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const trend = 1 + (days - d) / days; // grows ~2x over the window
    const perDay = Math.round((2 + random() * 4) * trend * (weekend ? 1.35 : 1));
    for (let i = 0; i < perDay; i++) {
      const at = new Date(day);
      at.setHours(8 + Math.floor(random() * 14), Math.floor(random() * 60), 0, 0);
      if (at.getTime() > now) continue;
      orders.push(
        assembleOrder(buildLines(active, random), random, at, statusForAge(d, random), "seed"),
      );
    }
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** A single realtime purchase from a simulated shopper. Returns null if nothing is purchasable. */
export function simulatePurchase(
  products: Product[],
  random: () => number = Math.random,
  now = new Date(),
): { order: Order; event: LiveEvent } | null {
  // Bias towards popular items, the way real traffic behaves.
  const purchasable = products
    .filter((p) => p.status === "active" && p.stock > 0)
    .sort((a, b) => b.soldCount - a.soldCount);
  if (purchasable.length === 0) return null;
  const pool = purchasable.slice(0, Math.max(10, Math.ceil(purchasable.length * 0.6)));
  const lines = buildLines(pool, random, 2).map((l) => {
    const stock = products.find((p) => p.id === l.productId)?.stock ?? 0;
    return { ...l, quantity: Math.min(l.quantity, stock) };
  });
  const order = assembleOrder(lines, random, now, "pending", "live");
  const first = lines[0]!;
  return {
    order,
    event: {
      id: createId("evt"),
      kind: "purchase",
      productId: first.productId,
      productTitle: first.title,
      thumbnail: first.thumbnail,
      customerName: order.customer.fullName.split(" ")[0],
      city: order.customer.city,
      amount: order.total,
      quantity: lines.reduce((n, l) => n + l.quantity, 0),
      at: order.createdAt,
    },
  };
}

/** Pseudo-live "people viewing now" count that drifts smoothly over time per product. */
export function viewersFor(productId: string, now = Date.now()) {
  let h = 0;
  for (let i = 0; i < productId.length; i++) h = (h * 31 + productId.charCodeAt(i)) | 0;
  const base = 6 + (Math.abs(h) % 30);
  const wave = Math.sin(now / 45_000 + (Math.abs(h) % 100)) * 4;
  return Math.max(2, Math.round(base + wave));
}
