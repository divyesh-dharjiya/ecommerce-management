"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, ProductImage, SectionHeading } from "@/components/ui";

/** How many categories the home page shows before "See all". */
const VISIBLE = 12;

/** Compact grid of category shortcuts: picture on top, name and count below. */
export function CategoryRail() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) if (p.status === "active") m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);

  // Most-stocked categories first, so the shortcuts lead somewhere worthwhile.
  const top = useMemo(
    () => [...categories].sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0)).slice(0, VISIBLE),
    [categories, counts],
  );

  return (
    <section className="py-12" aria-labelledby="categories-title">
      <Container>
        <SectionHeading
          id="categories-title"
          title="Shop by category"
          description="Pick a department to see everything in it."
          href="/categories"
          linkLabel="See all categories"
        />
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {top.map((c) => (
            <li key={c.id}>
              <Link
                href={`/categories/${c.slug}`}
                className="group flex h-full flex-col items-center rounded-2xl border border-border bg-card p-3 text-center transition hover:border-primary/40 hover:shadow-soft"
              >
                <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-muted">
                  <ProductImage
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 30vw, 160px"
                    className="object-contain p-[14%] transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="mt-2.5 line-clamp-1 text-sm font-semibold">{c.name}</span>
                <span className="text-xs text-muted-foreground">{counts.get(c.slug) ?? 0} items</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
