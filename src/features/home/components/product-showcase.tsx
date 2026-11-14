"use client";

import { useMemo, useState } from "react";
import { useStableOrder } from "@/hooks";
import { sortProducts } from "@/features/catalog/services/catalog";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Container, SectionHeading, SegmentedControl } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import type { SortOption } from "@/types";

const TABS = [
  { value: "best-selling", label: "Trending" },
  { value: "newest", label: "New in" },
  { value: "rating", label: "Top rated" },
] as const satisfies readonly { value: SortOption; label: string }[];

type TabValue = (typeof TABS)[number]["value"];

export function ProductShowcase() {
  const products = useCatalogStore((s) => s.products);
  const [sort, setSort] = useState<TabValue>("best-selling");

  const ranked = useMemo(
    () =>
      sortProducts(
        products.filter((p) => p.status === "active"),
        sort,
      ).slice(0, 8),
    [products, sort],
  );
  // Live sales change sold counts constantly — don't reshuffle cards under the cursor.
  const items = useStableOrder(ranked, (p) => p.id, sort);

  return (
    <section className="py-8">
      <Container>
        <Reveal>
          <SectionHeading title="Popular right now" href={`/products?sort=${sort}`}>
            <SegmentedControl label="Product collections" value={sort} onChange={setSort} options={TABS} />
          </SectionHeading>
        </Reveal>
        {/* Keyed by tab so cards replay their staggered entrance on switch. */}
        <ProductGrid key={sort} products={items} priorityCount={0} />
      </Container>
    </section>
  );
}
