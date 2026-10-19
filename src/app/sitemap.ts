import type { MetadataRoute } from "next";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...SEED_CATEGORIES.map((c) => ({
      url: absoluteUrl(`/categories/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: [c.image],
    })),
    ...SEED_PRODUCTS.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: new Date(p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      images: p.images.slice(0, 3),
    })),
  ];
}
