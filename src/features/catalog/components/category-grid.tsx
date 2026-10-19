"use client";

import Link from "next/link";
import { useMemo } from "react";
import { m } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui";
import { CategoryIcon } from "@/features/catalog/components/category-icon";

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
      if (s.images.length < 3) s.images.push(p.thumbnail);
      m.set(p.category, s);
    }
    return m;
  }, [products]);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c, i) => {
        const s = stats.get(c.slug);
        return (
          <m.div
            key={c.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
          >
            <Link
              href={`/categories/${c.slug}`}
              className="group relative flex h-64 flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div
                className="absolute inset-0 opacity-[0.12] transition-opacity duration-500 group-hover:opacity-25"
                style={{ background: `radial-gradient(circle at 85% 90%, ${c.accent}, transparent 60%)` }}
              />
              <div className="relative flex items-start justify-between">
                <span
                  className="grid size-11 place-items-center rounded-lg text-white shadow-lg"
                  style={{ backgroundColor: c.accent }}
                >
                  <CategoryIcon name={c.icon} className="size-5" />
                </span>
                <span className="grid size-10 place-items-center rounded-full border border-border bg-card transition group-hover:rotate-45 group-hover:bg-foreground group-hover:text-background">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
              <div className="relative mt-4 max-w-[55%]">
                <h2 className="font-display text-2xl tracking-tight">{c.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s?.count ?? 0} products{s && Number.isFinite(s.from) ? ` · from ${formatPrice(s.from)}` : ""}
                </p>
              </div>
              <div className="absolute bottom-4 right-4 flex items-end">
                {(s?.images ?? [c.image]).map((img, idx) => (
                  <div
                    key={img}
                    className="relative -ml-10 size-28 overflow-hidden rounded-lg border-4 border-card bg-muted shadow-lg transition-transform duration-500 first:ml-0 group-hover:-translate-y-1"
                    style={{ transitionDelay: `${idx * 60}ms`, zIndex: 3 - idx, rotate: `${(idx - 1) * 6}deg` }}
                  >
                    <ProductImage src={img} alt="" fill sizes="112px" className="object-contain p-2" />
                  </div>
                ))}
              </div>
            </Link>
          </m.div>
        );
      })}
    </div>
  );
}
