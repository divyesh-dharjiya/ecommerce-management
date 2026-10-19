import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/data";
import { OG_CONTENT_TYPE, OG_SIZE, loadImageAsPng, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Category preview";

export function generateStaticParams() {
  return SEED_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = SEED_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return renderOgCard({ title: "Shop every category" });
  const count = SEED_PRODUCTS.filter((p) => p.category === slug).length;
  return renderOgCard({
    eyebrow: `${count} products`,
    title: category.name,
    subtitle: category.description,
    accent: category.accent,
    image: await loadImageAsPng(category.image),
  });
}
