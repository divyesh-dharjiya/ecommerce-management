/**
 * Splits the generated catalog into what the browser needs and what only
 * the product page needs.
 *
 *   products.lite.json      → bundled into client JS (cards, search, cart)
 *   product-details.json    → read on the server per product page, and
 *                             lazy-loaded by the admin editor
 *
 * Reviews, full descriptions, spec text and extra gallery images are about
 * half the catalog's weight, yet no listing, card or cart uses them.
 *
 * Runs automatically at the end of `npm run seed:generate`; can also be run
 * on its own: `node scripts/build-lite-catalog.mjs`.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const DESCRIPTION_LIMIT = 160;

const truncate = (text) => {
  if (text.length <= DESCRIPTION_LIMIT) return text;
  return `${text.slice(0, text.lastIndexOf(" ", DESCRIPTION_LIMIT - 1))}…`;
};

const products = JSON.parse(await readFile(path.join(DATA, "products.json"), "utf8"));
const DETAIL_KEYS = ["reviews", "weight", "dimensions", "warranty", "shipping", "returnPolicy"];

const lite = products.map((p) => {
  const slim = { ...p, description: truncate(p.description), images: p.images.slice(0, 2), reviews: [] };
  for (const key of DETAIL_KEYS.filter((k) => k !== "reviews")) delete slim[key];
  return slim;
});

const details = Object.fromEntries(
  products.map((p) => [
    p.id,
    {
      description: p.description,
      images: p.images,
      ...Object.fromEntries(DETAIL_KEYS.filter((k) => p[k] !== undefined).map((k) => [k, p[k]])),
    },
  ]),
);

await writeFile(path.join(DATA, "products.lite.json"), JSON.stringify(lite) + "\n");
await writeFile(path.join(DATA, "product-details.json"), JSON.stringify(details) + "\n");

const kb = (v) => `${Math.round(JSON.stringify(v).length / 1024)}KB`;
console.log(`✔ lite catalog ${kb(lite)} (client) · details ${kb(details)} (server / on demand) · full ${kb(products)}`);
