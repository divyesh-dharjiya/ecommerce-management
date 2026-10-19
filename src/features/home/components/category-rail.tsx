"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, ProductImage, SectionHeading } from "@/components/ui";

/** Big image tiles with a white pill label, like a sports-brand category row. */
export function CategoryRail() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) if (p.status === "active") m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);

  return (
    <section className="py-14">
      <Container>
        <SectionHeading title="Shop by category" href="/categories" linkLabel="All categories" />
      </Container>
      <div className="mx-auto max-w-7xl">
        <ul className="flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:scroll-px-6 sm:gap-3 sm:px-6 lg:scroll-px-8 lg:px-8">
          {categories.map((c) => (
            <li key={c.id} className="w-56 shrink-0 snap-start sm:w-64">
              <Link
                href={`/categories/${c.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-muted"
              >
                <ProductImage
                  src={c.image}
                  alt=""
                  fill
                  sizes="256px"
                  className="object-contain p-[14%] transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-semibold shadow-soft">
                  {c.name}
                  <span className="text-muted-foreground">{counts.get(c.slug) ?? 0}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
