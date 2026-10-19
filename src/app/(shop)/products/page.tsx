import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { parseProductQuery, toSearchParams } from "@/features/catalog/services/query-params";
import { ProductExplorer } from "@/features/catalog/components/product-explorer";
import { ListingJsonLd, isFacetedQuery, listingCanonical } from "@/features/catalog/components/listing-seo";
import { Container, PageHeader } from "@/components/ui";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseProductQuery(toSearchParams(await searchParams));
  const title = query.search ? `Results for “${query.search}”` : "Shop all products";
  return buildMetadata({
    title,
    description: "Browse 100+ curated products across tech, fashion, beauty and home. Filter by category, brand, price and rating.",
    path: listingCanonical("/products", query),
    noIndex: isFacetedQuery(query),
  });
}

export default async function ProductsPage({ searchParams }: Props) {
  // Reading searchParams renders this page per request, so the server HTML
  // already contains the exact filtered results (good for SEO and LCP).
  const query = parseProductQuery(toSearchParams(await searchParams));
  return (
    <>
      <ListingJsonLd query={query} name="All products" />
      <PageHeader
        title="Shop all"
        description="Everything we love, in one place. Filter by category, brand, price and rating to find your next favourite."
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Shop" }]}
      />
      <Container className="py-10">
        <ProductExplorer />
      </Container>
    </>
  );
}
