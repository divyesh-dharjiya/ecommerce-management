/**
 * One-off catalog generator.
 *
 * Pulls the public DummyJSON catalog, picks a balanced set of 100 products
 * across every category, normalises them into our domain shape and writes
 * `src/data/products.json` + `src/data/categories.json`.
 *
 * The app never calls DummyJSON at runtime — the generated JSON is the seed
 * that gets persisted into localStorage on first visit.
 *
 * Usage: npm run seed:generate
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const TARGET = 100;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, "..", "src", "data");

const CATEGORY_META = {
  beauty: { icon: "Sparkles", accent: "#f472b6" },
  fragrances: { icon: "Flower2", accent: "#c084fc" },
  furniture: { icon: "Armchair", accent: "#a16207" },
  groceries: { icon: "ShoppingBasket", accent: "#22c55e" },
  "home-decoration": { icon: "Lamp", accent: "#f59e0b" },
  "kitchen-accessories": { icon: "CookingPot", accent: "#ef4444" },
  laptops: { icon: "Laptop", accent: "#3b82f6" },
  "mens-shirts": { icon: "Shirt", accent: "#0ea5e9" },
  "mens-shoes": { icon: "Footprints", accent: "#64748b" },
  "mens-watches": { icon: "Watch", accent: "#334155" },
  "mobile-accessories": { icon: "Headphones", accent: "#8b5cf6" },
  motorcycle: { icon: "Bike", accent: "#dc2626" },
  "skin-care": { icon: "Droplets", accent: "#14b8a6" },
  smartphones: { icon: "Smartphone", accent: "#6366f1" },
  "sports-accessories": { icon: "Dumbbell", accent: "#f97316" },
  sunglasses: { icon: "Glasses", accent: "#0f172a" },
  tablets: { icon: "Tablet", accent: "#2563eb" },
  tops: { icon: "Shirt", accent: "#ec4899" },
  vehicle: { icon: "Car", accent: "#475569" },
  "womens-bags": { icon: "ShoppingBag", accent: "#db2777" },
  "womens-dresses": { icon: "Gem", accent: "#e11d48" },
  "womens-jewellery": { icon: "Gem", accent: "#eab308" },
  "womens-shoes": { icon: "Footprints", accent: "#be185d" },
  "womens-watches": { icon: "Watch", accent: "#9333ea" },
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Deterministic PRNG so regenerating yields identical "random" fields.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const res = await fetch("https://dummyjson.com/products?limit=0");
if (!res.ok) throw new Error(`DummyJSON responded ${res.status}`);
const { products } = await res.json();

const byCategory = new Map();
for (const p of products) {
  if (!byCategory.has(p.category)) byCategory.set(p.category, []);
  byCategory.get(p.category).push(p);
}

// Round-robin across categories so the catalog is balanced.
const picked = [];
const queues = [...byCategory.values()].map((list) => [...list]);
while (picked.length < TARGET && queues.some((q) => q.length)) {
  for (const q of queues) {
    if (picked.length >= TARGET) break;
    const next = q.shift();
    if (next) picked.push(next);
  }
}

const rand = mulberry32(20261007);
const now = Date.UTC(2026, 9, 1);
const usedSlugs = new Set();

const normalised = picked.map((p, i) => {
  let slug = slugify(p.title);
  while (usedSlugs.has(slug)) slug = `${slug}-${p.id}`;
  usedSlugs.add(slug);

  const discount = Math.round(p.discountPercentage);
  const price = Number(p.price.toFixed(2));
  const compareAtPrice = discount >= 5 ? Number((price / (1 - discount / 100)).toFixed(2)) : null;

  return {
    id: `prd_${String(p.id).padStart(4, "0")}`,
    sku: p.sku,
    slug,
    title: p.title,
    description: p.description,
    brand: p.brand ?? "Luxe Essentials",
    category: p.category,
    price,
    compareAtPrice,
    rating: Number(p.rating.toFixed(1)),
    reviewCount: (p.reviews?.length ?? 0) * 37 + Math.floor(rand() * 400),
    stock: p.stock,
    tags: p.tags ?? [],
    thumbnail: p.thumbnail,
    images: p.images,
    weight: p.weight,
    dimensions: p.dimensions,
    warranty: p.warrantyInformation,
    shipping: p.shippingInformation,
    returnPolicy: p.returnPolicy,
    reviews: (p.reviews ?? []).map((r, ri) => ({
      id: `rev_${p.id}_${ri}`,
      author: r.reviewerName,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
    })),
    soldCount: Math.floor(rand() * 4800) + 120,
    isFeatured: i % 7 === 0,
    isNew: rand() > 0.78,
    status: "active",
    createdAt: new Date(now - Math.floor(rand() * 180) * 86_400_000).toISOString(),
  };
});

const categories = [...new Set(normalised.map((p) => p.category))].map((slug) => {
  const items = normalised.filter((p) => p.category === slug);
  const meta = CATEGORY_META[slug] ?? { icon: "Tag", accent: "#6366f1" };
  return {
    id: `cat_${slug}`,
    slug,
    name: slug
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    description: `Curated ${slug.replace(/-/g, " ")} picked for quality and value.`,
    image: items[0].thumbnail,
    icon: meta.icon,
    accent: meta.accent,
  };
});

await writeFile(path.join(OUT_DIR, "products.json"), JSON.stringify(normalised, null, 2));
await writeFile(path.join(OUT_DIR, "categories.json"), JSON.stringify(categories, null, 2));
console.log(`✔ Wrote ${normalised.length} products across ${categories.length} categories.`);
