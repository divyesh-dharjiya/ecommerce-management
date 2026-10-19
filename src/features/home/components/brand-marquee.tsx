"use client";

import { useMemo } from "react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";

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
    <section aria-label="Featured brands" className="overflow-hidden border-b border-border py-7">
      <div className="group flex [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12 group-hover:[animation-play-state:paused]">
          {[...brands, ...brands].map((b, i) => (
            <span
              key={`${b}-${i}`}
              aria-hidden={i >= brands.length}
              className="flex items-center gap-12 whitespace-nowrap font-display text-3xl italic text-foreground/35 transition-colors hover:text-foreground"
            >
              {b}
              <span className="size-1 rounded-full bg-accent" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
