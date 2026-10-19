import { SEED_PRODUCTS } from "@/data";
import { itemListSchema } from "@/lib/seo";
import { queryProducts } from "@/features/catalog/services/catalog";
import { JsonLd } from "@/components/seo/json-ld";
import type { ProductQuery } from "@/types";

/** Server-only ItemList structured data for the products currently listed. */
export function ListingJsonLd({ query, name }: { query: ProductQuery; name: string }) {
  const { items } = queryProducts(SEED_PRODUCTS, query);
  return <JsonLd data={itemListSchema(items, name)} />;
}

/** Filtered/sorted variants canonicalise to the clean listing URL (pagination kept). */
export function listingCanonical(path: string, query: ProductQuery) {
  return query.page && query.page > 1 ? `${path}?page=${query.page}` : path;
}

/** Faceted combinations shouldn't be indexed — only clean and paginated listings. */
export function isFacetedQuery(query: ProductQuery) {
  return Boolean(query.search || query.brands || query.minPrice !== undefined || query.maxPrice !== undefined || query.minRating || query.inStock || query.onSale || (query.sort && query.sort !== "featured"));
}
