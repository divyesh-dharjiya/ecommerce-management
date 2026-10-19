import type { Category, Product } from "@/types";
import productsJson from "./products.json";
import categoriesJson from "./categories.json";

/** Immutable seed catalog. Persisted stores are initialised from these on first visit. */
export const SEED_PRODUCTS = productsJson as Product[];
export const SEED_CATEGORIES = categoriesJson as Category[];
