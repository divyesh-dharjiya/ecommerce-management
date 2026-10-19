import "server-only";
import type { Product, ProductDetails } from "@/types";
import fullJson from "./products.json";
import detailsJson from "./product-details.json";

/** Full catalog for server-only work (structured data, sitemap). Never bundled for the browser. */
export const SEED_PRODUCTS_FULL = fullJson as Product[];

const DETAILS = detailsJson as Record<string, ProductDetails>;

/** Heavy per-product fields the product page needs: full description, reviews, specs, all images. */
export const getProductDetails = (id: string): ProductDetails | undefined => DETAILS[id];
