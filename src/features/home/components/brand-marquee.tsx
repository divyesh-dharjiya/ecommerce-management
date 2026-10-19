"use client";

import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";

/** Scrolling ticker of top brands, in heavy condensed type. */
export function BrandMarquee() {
  const products = useCatalogStore((s) => s.products);
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.brand, (counts.get(p.brand) ?? 0) + p.soldCount);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([b]) => b);
  }, [products]);

  return (
    <section aria-label="Featured brands" className="overflow-hidden border-b border-border py-5">
      <div className="group flex">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10 group-hover:[animation-play-state:paused]">
          {[...brands, ...brands].map((b, i) => (
            <span
              key={`${b}-${i}`}
              aria-hidden={i >= brands.length}
              className="flex items-center gap-10 whitespace-nowrap font-display text-4xl text-foreground"
            >
              {b}
              <span className="text-2xl text-accent" aria-hidden>
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
