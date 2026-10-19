"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, ProductImage, SectionHeading } from "@/components/ui";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const TINTS = ["bg-sand", "bg-sage", "bg-blush", "bg-sky"] as const;

export function CategoryRail() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) if (p.status === "active") m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);

  return (
    <section className="py-16">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Browse" title="Shop by category" href="/categories" linkLabel="All categories" />
        </Reveal>
      </Container>
      <div className="mx-auto max-w-7xl">
        <Stagger
          as="ul"
          step={0.04}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:px-6 lg:px-8"
        >
          {categories.map((c, i) => (
            <StaggerItem as="li" key={c.id} className="w-40 shrink-0 snap-start sm:w-48">
              <Link href={`/categories/${c.slug}`} className="group block">
                <div className={`relative aspect-square overflow-hidden rounded-lg ${TINTS[i % TINTS.length]}`}>
                  <ProductImage
                    src={c.image}
                    alt=""
                    fill
                    sizes="192px"
                    className="object-contain p-5 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110"
                  />
                </div>
                <p className="mt-3 text-[15px] font-medium underline-offset-4 group-hover:underline">{c.name}</p>
                <p className="text-xs text-muted-foreground">{counts.get(c.slug) ?? 0} products</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
