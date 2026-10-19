import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container, PageHeader } from "@/components/ui";
import { CategoryGrid } from "@/features/catalog/components/category-grid";

export const metadata: Metadata = buildMetadata({
  title: "Shop by category",
  description: "Explore every department — smartphones, laptops, fragrances, fashion, jewellery, home décor and more.",
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <>
      <PageHeader title="Categories" description="Explore every department in our store." breadcrumbs={[{ href: "/", label: "Home" }, { label: "Categories" }]} />
      <Container className="py-10">
        <CategoryGrid />
      </Container>
    </>
  );
}
