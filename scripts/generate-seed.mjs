/**
 * Catalog generator.
 *
 * Merges three public product datasets into one 250-product catalog:
 *   - DummyJSON  (all 194)  transparent cut-out photos
 *   - FakeStore  (all 20)   transparent cut-out photos
 *   - Platzi     (36 hand-picked) 1080×1080 studio photos
 *
 * Every image URL is fetched and verified; broken images are dropped, and a
 * product whose main image fails is skipped entirely. Writes
 * `src/data/products.json` + `src/data/categories.json`.
 *
 * Product ids are stable across runs (`prd_0001` = DummyJSON #1, `prd_fs_01`,
 * `prd_pz_01`), and per-product values are seeded from the id, so
 * regenerating never reshuffles existing products. Saved carts/wishlists and
 * the catalog merge (features/catalog/services/merge.ts) rely on this.
 *
 * The app never calls these APIs at runtime.
 *
 * Usage: npm run seed:generate
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const NOW = Date.UTC(2026, 9, 20);
const DAY = 86_400_000;

// ── Deterministic per-product randomness ─────────────────────────────────────
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seedStr) {
  let s = hash(seedStr);
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const money = (n) => Number(n.toFixed(2));

// ── Categories ───────────────────────────────────────────────────────────────
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
  // New in this catalog
  streetwear: {
    icon: "Shirt",
    accent: "#d9482b",
    name: "Streetwear",
    description: "Hoodies, tees, joggers and caps built for everyday wear.",
  },
  outerwear: {
    icon: "Shirt",
    accent: "#3f6d5b",
    name: "Outerwear",
    description: "Jackets and coats for every kind of weather.",
  },
  computing: {
    icon: "Laptop",
    accent: "#2f5d8a",
    name: "Computing",
    description: "Storage, monitors and peripherals for work and play.",
  },
  travel: {
    icon: "ShoppingBag",
    accent: "#7a5c3e",
    name: "Bags & Travel",
    description: "Backpacks and luggage that go the distance.",
  },
};

// ── FakeStore mapping (id → category, brand) ─────────────────────────────────
const FAKESTORE = {
  1: ["travel", "Fjällräven"],
  2: ["mens-shirts", "Luxe Essentials"],
  3: ["outerwear", "Luxe Essentials"],
  4: ["mens-shirts", "Luxe Essentials"],
  5: ["womens-jewellery", "John Hardy"],
  6: ["womens-jewellery", "Luxe Fine"],
  7: ["womens-jewellery", "Luxe Fine"],
  8: ["womens-jewellery", "Pierced Owl"],
  9: ["computing", "WD"],
  10: ["computing", "SanDisk"],
  11: ["computing", "Silicon Power"],
  12: ["computing", "WD"],
  13: ["computing", "Acer"],
  14: ["computing", "Samsung"],
  15: ["outerwear", "BIYLACLESEN"],
  16: ["outerwear", "Lock and Love"],
  17: ["outerwear", "Luxe Outdoor"],
  18: ["tops", "MBJ"],
  19: ["tops", "Opna"],
  20: ["tops", "DANVOUY"],
};

// ── Platzi curation (id → category, realistic price) ─────────────────────────
// The sandbox's own prices are random (e.g. a leather sofa at $53), so each
// curated item gets a sensible retail price instead.
const PLATZI = {
  1: ["streetwear", 34],
  2: ["streetwear", 59],
  3: ["streetwear", 64],
  5: ["streetwear", 69],
  6: ["streetwear", 48],
  9: ["streetwear", 28],
  13: ["streetwear", 44],
  15: ["streetwear", 24],
  17: ["streetwear", 26],
  4: ["streetwear", 66],
  14: ["streetwear", 38],
  19: ["mobile-accessories", 129],
  20: ["mobile-accessories", 89],
  25: ["mobile-accessories", 119],
  26: ["mobile-accessories", 29],
  27: ["mobile-accessories", 199],
  18: ["computing", 64],
  22: ["computing", 39],
  24: ["laptops", 1299],
  21: ["kitchen-accessories", 49],
  51: ["kitchen-accessories", 36],
  28: ["furniture", 1499],
  29: ["furniture", 899],
  30: ["furniture", 1199],
  31: ["furniture", 549],
  32: ["furniture", 1049],
  34: ["furniture", 389],
  35: ["mens-shoes", 119],
  38: ["mens-shoes", 98],
  40: ["mens-shoes", 149],
  43: ["mens-shoes", 129],
  36: ["womens-shoes", 89],
  37: ["womens-shoes", 64],
  42: ["womens-shoes", 139],
  47: ["fragrances", 95],
  48: ["travel", 229],
};

// ── Image verification ───────────────────────────────────────────────────────
const verified = new Map();
async function imageOk(url) {
  if (verified.has(url)) return verified.get(url);
  let ok = false;
  for (let attempt = 0; attempt < 2 && !ok; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const type = res.headers.get("content-type") ?? "";
      const size = (await res.arrayBuffer()).byteLength;
      ok = res.ok && type.startsWith("image/") && size > 2000;
    } catch {
      ok = false;
    }
  }
  verified.set(url, ok);
  return ok;
}
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

// ── Normalisation ────────────────────────────────────────────────────────────
const DEFAULTS = {
  warranty: "1 year warranty",
  shipping: "Ships in 2-3 business days",
  returnPolicy: "30 days return policy",
};

function finish(base, r) {
  const discountRoll = r();
  const discount = discountRoll > 0.55 ? Math.round(5 + r() * 18) : 0;
  return {
    reviews: [],
    tags: [],
    ...DEFAULTS,
    ...base,
    compareAtPrice:
      base.compareAtPrice !== undefined
        ? base.compareAtPrice
        : discount
          ? money(base.price / (1 - discount / 100))
          : null,
    soldCount: base.soldCount ?? Math.floor(r() * 4800) + 120,
    isFeatured: base.isFeatured ?? r() > 0.86,
    status: "active",
  };
}

function fromDummy(p) {
  const id = `prd_${String(p.id).padStart(4, "0")}`;
  const r = rng(id);
  const discount = Math.round(p.discountPercentage);
  return finish(
    {
      id,
      sku: p.sku,
      title: p.title,
      description: p.description,
      brand: p.brand ?? "Luxe Essentials",
      category: p.category,
      price: money(p.price),
      compareAtPrice: discount >= 5 ? money(p.price / (1 - discount / 100)) : null,
      rating: Number(p.rating.toFixed(1)),
      reviewCount: (p.reviews?.length ?? 0) * 37 + Math.floor(r() * 400),
      stock: p.stock,
      tags: p.tags ?? [],
      thumbnail: p.thumbnail,
      images: p.images,
      imageStyle: "cutout",
      weight: p.weight,
      dimensions: p.dimensions,
      warranty: p.warrantyInformation,
      shipping: p.shippingInformation,
      returnPolicy: p.returnPolicy,
      reviews: (p.reviews ?? []).map((rv, i) => ({
        id: `rev_${p.id}_${i}`,
        author: rv.reviewerName,
        rating: rv.rating,
        comment: rv.comment,
        date: rv.date,
      })),
      isNew: r() > 0.85,
      createdAt: new Date(NOW - Math.floor(r() * 200 + 25) * DAY).toISOString(),
    },
    r,
  );
}

function fromFakeStore(p) {
  const [category, brand] = FAKESTORE[p.id];
  const id = `prd_fs_${String(p.id).padStart(2, "0")}`;
  const r = rng(id);
  return finish(
    {
      id,
      sku: `FS-${category.slice(0, 3).toUpperCase()}-${String(p.id).padStart(3, "0")}`,
      title: p.title.trim().replace(/\s+/g, " "),
      description: p.description.trim(),
      brand,
      category,
      price: money(p.price),
      rating: Number(p.rating.rate.toFixed(1)),
      reviewCount: p.rating.count,
      stock: 8 + Math.floor(r() * 90),
      tags: [category.replace(/-/g, " "), brand.toLowerCase()],
      thumbnail: p.image,
      images: [p.image],
      imageStyle: "cutout",
      // Newest arrivals: added within the last three weeks.
      isNew: true,
      createdAt: new Date(NOW - Math.floor(r() * 20 + 1) * DAY).toISOString(),
    },
    r,
  );
}

const cleanUrl = (s) => String(s).replace(/^\[?"?|"?\]?$/g, "");

function fromPlatzi(p) {
  const [category, price] = PLATZI[p.id];
  const id = `prd_pz_${String(p.id).padStart(2, "0")}`;
  const r = rng(id);
  const images = p.images.map(cleanUrl);
  return finish(
    {
      id,
      sku: `LS-${category.slice(0, 3).toUpperCase()}-${String(p.id).padStart(3, "0")}`,
      title: p.title.trim(),
      description: p.description.trim(),
      brand: "Luxe Studio",
      category,
      price,
      rating: Number((3.9 + r() * 0.9).toFixed(1)),
      reviewCount: 40 + Math.floor(r() * 600),
      stock: 6 + Math.floor(r() * 70),
      tags: [
        category.replace(/-/g, " "),
        ...p.title
          .toLowerCase()
          .split(/[^a-z]+/)
          .filter((w) => w.length > 4)
          .slice(0, 3),
      ],
      thumbnail: images[0],
      images,
      imageStyle: "photo",
      isNew: true,
      createdAt: new Date(NOW - Math.floor(r() * 20 + 1) * DAY).toISOString(),
    },
    r,
  );
}

// ── Run ──────────────────────────────────────────────────────────────────────
const getJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json();
};

const [dummy, fakestore, platzi] = await Promise.all([
  getJson("https://dummyjson.com/products?limit=0").then((d) => d.products),
  getJson("https://fakestoreapi.com/products"),
  getJson("https://api.escuelajs.co/api/v1/products?offset=0&limit=500"),
]);

const candidates = [
  ...dummy.map(fromDummy),
  ...fakestore.filter((p) => FAKESTORE[p.id]).map(fromFakeStore),
  ...platzi.filter((p) => PLATZI[p.id]).map(fromPlatzi),
];

const allUrls = [...new Set(candidates.flatMap((p) => [p.thumbnail, ...p.images]))];
process.stdout.write(`Verifying ${allUrls.length} images… `);
await pool(allUrls, 12, imageOk);
const broken = allUrls.filter((u) => !verified.get(u));
console.log(`${allUrls.length - broken.length} ok, ${broken.length} broken`);

// Keep every existing product's slug so shared links and SEO URLs never change.
const legacySlugs = new Map(
  JSON.parse(await readFile(path.join(OUT_DIR, "products.json"), "utf8").catch(() => "[]")).map((p) => [p.id, p.slug]),
);
const reserved = new Set(legacySlugs.values());
const usedSlugs = new Set();
const products = [];
for (const p of candidates) {
  if (!verified.get(p.thumbnail)) continue; // no usable main image → skip product
  const images = p.images.filter((u) => verified.get(u));
  let slug = legacySlugs.get(p.id) ?? slugify(p.title).slice(0, 80).replace(/-+$/, "");
  while (usedSlugs.has(slug) || (!legacySlugs.has(p.id) && reserved.has(slug)))
    slug = `${slug}-${p.id.split("_").pop()}`;
  usedSlugs.add(slug);
  products.push({ ...p, slug, images: images.length ? images : [p.thumbnail] });
}

const order = [...new Set(products.map((p) => p.category))];
const categories = order.map((slug) => {
  const meta = CATEGORY_META[slug] ?? { icon: "Tag", accent: "#6366f1" };
  const items = products.filter((p) => p.category === slug);
  const name =
    meta.name ??
    slug
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  return {
    id: `cat_${slug}`,
    slug,
    name,
    description: meta.description ?? `Curated ${slug.replace(/-/g, " ")} picked for quality and value.`,
    image: (items.find((p) => p.imageStyle === "cutout") ?? items[0]).thumbnail,
    icon: meta.icon,
    accent: meta.accent,
  };
});

await writeFile(path.join(OUT_DIR, "products.json"), JSON.stringify(products, null, 2) + "\n");
await writeFile(path.join(OUT_DIR, "categories.json"), JSON.stringify(categories, null, 2) + "\n");

const bySource = (prefix) => products.filter((p) => p.id.startsWith(prefix)).length;
console.log(
  `✔ ${products.length} products across ${categories.length} categories ` +
    `(DummyJSON ${bySource("prd_0")}, FakeStore ${bySource("prd_fs")}, Platzi ${bySource("prd_pz")})`,
);
if (broken.length) console.log("Dropped broken images:\n  " + broken.join("\n  "));
