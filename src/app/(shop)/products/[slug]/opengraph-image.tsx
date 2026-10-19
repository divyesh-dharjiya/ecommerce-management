import { SEED_PRODUCTS } from "@/data";
import { formatPrice } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, loadImageAsPng, renderOgCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Product preview";

export function generateStaticParams() {
  return SEED_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = SEED_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return renderOgCard({ title: "Discover something new" });
  return renderOgCard({
    eyebrow: product.brand,
    title: product.title,
    subtitle: `Rated ${product.rating.toFixed(1)}/5 · ${product.reviewCount.toLocaleString()} ratings`,
    price: formatPrice(product.price),
    image: await loadImageAsPng(product.thumbnail),
  });
}
