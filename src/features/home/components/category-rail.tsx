"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { Container, ProductImage, SectionHeading } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export function CategoryRail() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) if (p.status === "active") m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);

  return (
    <section className="py-12">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Browse" title="Shop by category" href="/categories" linkLabel="All categories" />
        </Reveal>
      </Container>
      <div className="mx-auto max-w-7xl">
        <Stagger as="ul" step={0.04} className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:px-6 lg:px-8">
          {categories.map((c) => (
            <StaggerItem as="li" key={c.id} className="snap-start">
              <Link
                href={`/categories/${c.slug}`}
                className="group relative flex h-56 w-44 flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift"
              >
                <div
                  className="absolute inset-x-0 bottom-0 h-2/3 opacity-20 transition-opacity duration-500 group-hover:opacity-35"
                  style={{ background: `radial-gradient(circle at 50% 100%, ${c.accent}, transparent 70%)` }}
                  aria-hidden
                />
                <span className="grid size-9 place-items-center rounded-xl text-white" style={{ backgroundColor: c.accent }}>
                  <CategoryIcon name={c.icon} className="size-4" />
                </span>
                <p className="mt-3 font-semibold leading-tight">{c.name}</p>
                <p className="text-xs text-muted-foreground">{counts.get(c.slug) ?? 0} products</p>
                <div className="relative mt-auto h-24">
                  <ProductImage src={c.image} alt="" fill sizes="160px" className="object-contain transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-3 group-hover:scale-110" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
