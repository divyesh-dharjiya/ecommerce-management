import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Category, Product } from "@/types";

/**
 * SEO helpers: one place that builds page metadata (canonical, Open Graph,
 * Twitter) and schema.org structured data, so every route is consistent.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

interface PageSeo {
  title?: string;
  description?: string;
  /** Path used for the canonical URL, e.g. `/products/iphone-13`. */
  path: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  noIndex?: boolean;
  keywords?: string[];
  other?: Record<string, string>;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path,
  images,
  noIndex,
  keywords,
  other,
}: PageSeo): Metadata {
  const fullTitle = title ? `${title} · ${siteConfig.fullName}` : siteConfig.fullName;
  return {
    title,
    description,
    keywords,
    // noindex pages deliberately omit a canonical: Google treats noindex + canonical as conflicting signals.
    alternates: noIndex ? undefined : { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.fullName,
      locale: "en_US",
      url: path,
      title: fullTitle,
      description,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(images && { images: images.map((i) => i.url) }),
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
    other,
  };
}

/** Trim to a search-snippet friendly length on a word boundary. */
export function truncate(text: string, max = 155) {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`;
}

// ── schema.org builders ──────────────────────────────────────────────────────
type Schema = Record<string, unknown>;

export const organizationSchema = (): Schema => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: siteConfig.fullName,
  url: SITE_URL,
  logo: absoluteUrl("/icon"),
  email: siteConfig.supportEmail,
});

export const websiteSchema = (): Schema => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: siteConfig.fullName,
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbSchema = (items: { label: string; href?: string }[]): Schema => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.label,
    ...(item.href && { item: absoluteUrl(item.href) }),
  })),
});

export const productSchema = (product: Product, category?: Category): Schema => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": absoluteUrl(`/products/${product.slug}#product`),
  name: product.title,
  description: product.description,
  image: product.images.length ? product.images : [product.thumbnail],
  sku: product.sku,
  brand: { "@type": "Brand", name: product.brand },
  category: category?.name,
  ...(product.reviewCount > 0 && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
    },
  }),
  review: product.reviews.slice(0, 5).map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.author },
    datePublished: r.date.slice(0, 10),
    reviewBody: r.comment,
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
  })),
  offers: {
    "@type": "Offer",
    url: absoluteUrl(`/products/${product.slug}`),
    priceCurrency: siteConfig.currency,
    price: product.price.toFixed(2),
    availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": `${SITE_URL}/#organization` },
  },
});

export const itemListSchema = (products: Product[], name: string): Schema => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: absoluteUrl(`/products/${p.slug}`),
    name: p.title,
  })),
});
