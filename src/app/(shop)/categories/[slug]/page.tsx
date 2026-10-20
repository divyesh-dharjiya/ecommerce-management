import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEED_CATEGORIES } from "@/data";
import { buildMetadata } from "@/lib/seo";
import { parseProductQuery, toSearchParams } from "@/features/catalog/services/query-params";
import { CategoryView } from "@/features/catalog/components/category-view";
import { ListingJsonLd, isFacetedQuery, listingCanonical } from "@/features/catalog/components/listing-seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const isValidSlug = (slug: string) => /^[a-z0-9-]{1,80}$/.test(slug);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const query = parseProductQuery(toSearchParams(await searchParams));
  const category = SEED_CATEGORIES.find((c) => c.slug === slug);
  const name = category?.name ?? slug.replace(/-/g, " ");
  return buildMetadata({
    title: `${name} — shop ${name.toLowerCase()} online`,
    description: category?.description ?? `Shop ${name} at Luxe with free shipping over $100.`,
    path: listingCanonical(`/categories/${slug}`, query),
    noIndex: !category || isFacetedQuery(query),
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const query = parseProductQuery(toSearchParams(await searchParams));
  const seedCategory = SEED_CATEGORIES.find((c) => c.slug === slug);

  return (
    <>
      {seedCategory && <ListingJsonLd query={{ ...query, category: slug }} name={seedCategory.name} />}
      {/* Client: admin-created categories exist only in the browser's store. */}
      <CategoryView slug={slug} />
    </>
  );
}
