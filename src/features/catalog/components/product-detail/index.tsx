"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { PackageX } from "lucide-react";
import { useHydrated } from "@/store/ui-store";
import { getRelatedProducts } from "@/features/catalog/services/catalog";
import { useCatalogStore, useProductBySlug } from "@/features/catalog/store/catalog-store";
import { useRecentlyViewedStore } from "@/features/catalog/store/recently-viewed-store";
import { Breadcrumbs, buttonClasses, Container, EmptyState, SectionHeading, Skeleton } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { RecentlyViewed } from "@/features/catalog/components/recently-viewed";
import { ProductGallery } from "@/features/catalog/components/product-detail/gallery";
import { PurchasePanel } from "@/features/catalog/components/product-detail/purchase-panel";
import { ProductTabs } from "@/features/catalog/components/product-detail/product-tabs";
import type { Product } from "@/types";

/**
 * Product page. Server-rendered from the seed catalogue (full content for
 * crawlers), then reconciled with the live store after hydration — admin
 * edits, live stock and admin-created products all appear.
 */
export function ProductDetail({ slug }: { slug: string }) {
  const product = useProductBySlug(slug);
  const hydrated = useHydrated();

  if (!product || product.status !== "active") {
    if (!hydrated) return <DetailSkeleton />;
    return (
      <EmptyState
        icon={<PackageX className="size-9" />}
        title="Product not found"
        description="This product may have been removed or is no longer available."
        action={<Link href="/products" className={buttonClasses()}>Continue shopping</Link>}
      />
    );
  }
  return <ProductDetailView key={product.id} product={product} />;
}

function ProductDetailView({ product }: { product: Product }) {
  const products = useCatalogStore((s) => s.products);
  const category = useCatalogStore((s) => s.categories.find((c) => c.slug === product.category));
  const track = useRecentlyViewedStore((s) => s.track);
  const hydrated = useHydrated();
  const related = useMemo(() => getRelatedProducts(products, product, 4), [products, product]);

  useEffect(() => {
    if (hydrated) track(product.id);
  }, [hydrated, product.id, track]);

  return (
    <>
      <Container className="py-8">
        <Breadcrumbs
          className="mb-6"
          items={[
            { href: "/", label: "Home" },
            { href: `/categories/${product.category}`, label: category?.name ?? product.category },
            { label: product.title },
          ]}
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images.length ? product.images : [product.thumbnail]} title={product.title} />
          <PurchasePanel product={product} />
        </div>
        <ProductTabs product={product} category={category} />
      </Container>

      {related.length > 0 && (
        <section className="py-12">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="You may also like" title="Related products" href={`/categories/${product.category}`} />
            </Reveal>
            <ProductGrid products={related} priorityCount={0} />
          </Container>
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}

function DetailSkeleton() {
  return (
    <Container className="grid grid-cols-1 gap-10 py-14 lg:grid-cols-2">
      <Skeleton className="aspect-square rounded-[2rem]" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </Container>
  );
}
