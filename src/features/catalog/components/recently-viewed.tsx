"use client";

import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useRecentlyViewedStore } from "@/features/catalog/store/recently-viewed-store";
import { useHydrated } from "@/store/ui-store";
import { Container, SectionHeading } from "@/components/ui";
import { ProductGrid } from "@/features/catalog/components/product-grid";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const hydrated = useHydrated();
  const ids = useRecentlyViewedStore((s) => s.ids);
  const products = useCatalogStore((s) => s.products);
  const items = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return ids
      .filter((id) => id !== excludeId)
      .flatMap((id) => {
        const p = byId.get(id);
        return p && p.status === "active" ? [p] : [];
      })
      .slice(0, 4);
  }, [ids, products, excludeId]);

  if (!hydrated || items.length === 0) return null;

  return (
    <section className="py-12">
      <Container>
        <SectionHeading eyebrow="Pick up where you left off" title="Recently viewed" />
        <ProductGrid products={items} priorityCount={0} />
      </Container>
    </section>
  );
}
