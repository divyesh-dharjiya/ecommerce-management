"use client";

import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";

export function BrandMarquee() {
  const products = useCatalogStore((s) => s.products);
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.brand, (counts.get(p.brand) ?? 0) + p.soldCount);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([b]) => b);
  }, [products]);

  return (
    <section aria-label="Featured brands" className="border-y border-border bg-muted/30 py-8">
      <div className="group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-14 pr-14 group-hover:[animation-play-state:paused]">
          {[...brands, ...brands].map((b, i) => (
            <span
              key={`${b}-${i}`}
              aria-hidden={i >= brands.length}
              className="whitespace-nowrap font-display text-2xl font-bold tracking-tight text-foreground/25 transition hover:text-foreground"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
