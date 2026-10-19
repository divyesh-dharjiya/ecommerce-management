"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogFacets } from "@/features/catalog/services/catalog";
import type { Category, ProductQuery } from "@/types";

interface FiltersProps {
  query: ProductQuery;
  facets: CatalogFacets;
  categories: Category[];
  lockedCategory?: string;
  onChange: (patch: Partial<ProductQuery>) => void;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-border pb-6">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  count?: number;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border group-hover:border-primary/50",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

const PRICE_PRESETS = [
  { label: "Under $25", min: undefined, max: 25 },
  { label: "$25 – $100", min: 25, max: 100 },
  { label: "$100 – $500", min: 100, max: 500 },
  { label: "$500+", min: 500, max: undefined },
];

export function Filters({ query, facets, categories, lockedCategory, onChange }: FiltersProps) {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [min, setMin] = useState(query.minPrice?.toString() ?? "");
  const [max, setMax] = useState(query.maxPrice?.toString() ?? "");
  const brands = showAllBrands ? facets.brands : facets.brands.slice(0, 8);
  const selectedBrands = new Set(query.brands ?? []);

  const applyPrice = (e?: React.FormEvent) => {
    e?.preventDefault();
    const lo = min === "" ? undefined : Math.max(0, Number(min));
    const hi = max === "" ? undefined : Math.max(0, Number(max));
    onChange({ minPrice: lo, maxPrice: hi !== undefined && lo !== undefined && hi < lo ? lo : hi });
  };

  return (
    <div className="space-y-6">
      {!lockedCategory && (
        <Group title="Category">
          <div className="max-h-64 space-y-0.5 overflow-y-auto pr-1">
            <CheckRow checked={!query.category} onChange={() => onChange({ category: undefined })} label="All categories" />
            {categories.map((c) => (
              <CheckRow
                key={c.id}
                checked={query.category === c.slug}
                onChange={() => onChange({ category: query.category === c.slug ? undefined : c.slug, brands: undefined })}
                label={c.name}
              />
            ))}
          </div>
        </Group>
      )}

      <Group title="Price">
        <div className="mb-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => {
            const active = query.minPrice === p.min && query.maxPrice === p.max;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setMin(p.min?.toString() ?? "");
                  setMax(p.max?.toString() ?? "");
                  onChange(active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: p.min, maxPrice: p.max });
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <form onSubmit={applyPrice} className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={() => applyPrice()}
            placeholder={`$${facets.priceRange.min}`}
            aria-label="Minimum price"
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={() => applyPrice()}
            placeholder={`$${facets.priceRange.max}`}
            aria-label="Maximum price"
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </form>
      </Group>

      <Group title="Customer rating">
        <div className="space-y-0.5">
          {[4.5, 4, 3].map((r) => (
            <CheckRow
              key={r}
              checked={query.minRating === r}
              onChange={() => onChange({ minRating: query.minRating === r ? undefined : r })}
              label={
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" /> {r}+ stars
                </span>
              }
            />
          ))}
        </div>
      </Group>

      {facets.brands.length > 0 && (
        <Group title="Brand">
          <div className="space-y-0.5">
            {brands.map((b) => (
              <CheckRow
                key={b.name}
                checked={selectedBrands.has(b.name)}
                count={b.count}
                label={b.name}
                onChange={() => {
                  const next = new Set(selectedBrands);
                  if (next.has(b.name)) next.delete(b.name);
                  else next.add(b.name);
                  onChange({ brands: next.size ? [...next] : undefined });
                }}
              />
            ))}
          </div>
          {facets.brands.length > 8 && (
            <button type="button" onClick={() => setShowAllBrands((v) => !v)} className="mt-2 text-sm font-semibold text-primary">
              {showAllBrands ? "Show less" : `Show all ${facets.brands.length}`}
            </button>
          )}
        </Group>
      )}

      <Group title="Availability">
        <CheckRow checked={!!query.inStock} onChange={() => onChange({ inStock: !query.inStock || undefined })} label="In stock only" />
        <CheckRow checked={!!query.onSale} onChange={() => onChange({ onSale: !query.onSale || undefined })} label="On sale" />
      </Group>
    </div>
  );
}
