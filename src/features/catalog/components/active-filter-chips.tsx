"use client";

import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import { spring } from "@/lib/motion";
import type { Category, ProductQuery } from "@/types";

interface Chip {
  label: string;
  clear: Partial<ProductQuery>;
}

/** Derives removable chips from the active query. Pure — easy to test/reuse. */
export function filterChips(query: ProductQuery, categories: Category[], lockedCategory?: string): Chip[] {
  const chips: Chip[] = [];
  if (query.category && !lockedCategory) {
    chips.push({
      label: categories.find((c) => c.slug === query.category)?.name ?? query.category,
      clear: { category: undefined },
    });
  }
  for (const brand of query.brands ?? []) {
    const rest = query.brands!.filter((b) => b !== brand);
    chips.push({ label: brand, clear: { brands: rest.length ? rest : undefined } });
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    chips.push({
      label: `$${query.minPrice ?? 0} – ${query.maxPrice !== undefined ? `$${query.maxPrice}` : "any"}`,
      clear: { minPrice: undefined, maxPrice: undefined },
    });
  }
  if (query.minRating) chips.push({ label: `${query.minRating}+ stars`, clear: { minRating: undefined } });
  if (query.inStock) chips.push({ label: "In stock", clear: { inStock: undefined } });
  if (query.onSale) chips.push({ label: "On sale", clear: { onSale: undefined } });
  return chips;
}

export function ActiveFilterChips({
  chips,
  onClear,
}: {
  chips: Chip[];
  onClear: (patch: Partial<ProductQuery>) => void;
}) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      {chips.map((c) => (
        <m.button
          key={c.label}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={spring.snappy}
          type="button"
          onClick={() => onClear(c.clear)}
          aria-label={`Remove filter ${c.label}`}
          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          {c.label} <X className="size-3" />
        </m.button>
      ))}
    </AnimatePresence>
  );
}
