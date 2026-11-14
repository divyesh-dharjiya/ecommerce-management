"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui";
import { CategoryIcon } from "@/features/catalog/components/category-icon";

/**
 * Every department as a simple card: a strip of three real products on top,
 * then the name, item count and starting price underneath — nothing overlaps.
 */
export function CategoryGrid() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; from: number; images: string[] }>();
    for (const p of products) {
      if (p.status !== "active") continue;
      const s = m.get(p.category) ?? { count: 0, from: Infinity, images: [] };
      s.count += 1;
      s.from = Math.min(s.from, p.price);
      if (s.images.length < 3 && !s.images.includes(p.thumbnail)) s.images.push(p.thumbnail);
      m.set(p.category, s);
    }
    return m;
  }, [products]);

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const s = stats.get(c.slug);
        const images = s?.images.length ? s.images : [c.image];
        return (
          <li key={c.id}>
            <Link
              href={`/categories/${c.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-lift"
            >
              <div className="grid grid-cols-3 gap-1 bg-muted p-1">
                {[0, 1, 2].map((idx) => {
                  const img = images[idx];
                  return (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-xl bg-card">
                      {img && (
                        <ProductImage
                          src={img}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 33vw, 140px"
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-1 items-center gap-3 p-4">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: c.accent }}
                  aria-hidden
                >
                  <CategoryIcon name={c.icon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {s?.count ?? 0} items
                    {s && Number.isFinite(s.from) ? ` · from ${formatPrice(s.from)}` : ""}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
