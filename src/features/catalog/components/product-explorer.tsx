"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, PackageSearch, SlidersHorizontal } from "lucide-react";
import { useDebounce, useStableOrder } from "@/hooks";
import { usePreferencesStore } from "@/store/preferences-store";
import { countActiveFilters, serializeProductQuery } from "@/features/catalog/services/query-params";
import { getFacets, queryProducts, SORT_OPTIONS } from "@/features/catalog/services/catalog";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useProductQuery } from "@/features/catalog/hooks/use-product-query";
import { Button, Drawer, EmptyState, Pagination, SearchInput, SegmentedControl, Select } from "@/components/ui";
import { Filters } from "@/features/catalog/components/filters";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { ActiveFilterChips, filterChips } from "@/features/catalog/components/active-filter-chips";
import type { ProductQuery, SortOption } from "@/types";

const VIEW_OPTIONS = [
  { value: "grid", label: <LayoutGrid className="size-4" />, ariaLabel: "Grid view" },
  { value: "list", label: <List className="size-4" />, ariaLabel: "List view" },
] as const;

/** Search box: instant local typing, debounced into the URL, mirrors external URL changes. */
function useSearchTerm(urlSearch: string | undefined, onCommit: (term: string | undefined) => void) {
  const [term, setTerm] = useState(urlSearch ?? "");
  const [synced, setSynced] = useState(urlSearch);
  if (urlSearch !== synced) {
    setSynced(urlSearch);
    setTerm(urlSearch ?? "");
  }
  const debounced = useDebounce(term, 300);
  useEffect(() => {
    const next = debounced.trim() || undefined;
    if (next !== urlSearch) onCommit(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [debounced]);
  return [term, setTerm] as const;
}

/**
 * Catalogue browsing: search, faceted filters, sorting, grid/list layouts and
 * crawlable pagination — all URL-driven. Server-rendered from the seed
 * catalogue so crawlers see real products; live store data takes over after
 * hydration.
 */
export function ProductExplorer({ lockedCategory }: { lockedCategory?: string }) {
  const { query, update, reset, hrefFor } = useProductQuery(lockedCategory);
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const viewMode = usePreferencesStore((s) => s.viewMode);
  const setViewMode = usePreferencesStore((s) => s.setViewMode);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [term, setTerm] = useSearchTerm(query.search, (search) => update({ search }));

  const result = useMemo(() => queryProducts(products, query), [products, query]);
  // Live sales shouldn't reshuffle the grid while someone is browsing it.
  const items = useStableOrder(result.items, (p) => p.id, serializeProductQuery(query));
  const facets = useMemo(() => getFacets(products, query.category), [products, query.category]);
  const activeFilters = countActiveFilters(query, lockedCategory);
  const chips = filterChips(query, categories, lockedCategory);

  const clearAll = () => {
    setTerm("");
    reset();
  };

  const filters = (
    <Filters
      key={`${query.minPrice}-${query.maxPrice}`}
      query={query}
      facets={facets}
      categories={categories}
      lockedCategory={lockedCategory}
      onChange={update}
    />
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 pr-2 scrollbar-none">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            {activeFilters > 0 && (
              <button type="button" onClick={clearAll} className="text-sm font-medium text-accent">
                Clear all
              </button>
            )}
          </div>
          {filters}
        </div>
      </aside>

      <section className="min-w-0" aria-label="Results">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <SearchInput
            value={term}
            onValueChange={setTerm}
            size="lg"
            placeholder="Search products, brands…"
            className="min-w-0 flex-1 basis-60"
          />
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="size-4" /> Filters
            {activeFilters > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </Button>
          <div className="w-52">
            <Select
              value={query.sort ?? "featured"}
              onChange={(e) => update({ sort: e.target.value as SortOption })}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <SegmentedControl
            label="Layout"
            variant="solid"
            value={viewMode}
            onChange={setViewMode}
            options={VIEW_OPTIONS}
            className="max-sm:hidden"
          />
        </div>

        <div className="mb-5 flex min-h-7 flex-wrap items-center gap-2">
          <p className="mr-2 text-sm text-muted-foreground" aria-live="polite">
            <span className="font-semibold text-foreground">{result.total}</span>{" "}
            {result.total === 1 ? "product" : "products"}
            {query.search && (
              <>
                {" "}
                for <span className="font-semibold text-foreground">“{query.search}”</span>
              </>
            )}
          </p>
          <ActiveFilterChips chips={chips} onClear={update} />
        </div>

        {result.total === 0 ? (
          <EmptyState
            icon={<PackageSearch className="size-9" />}
            title="No products found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={<Button onClick={clearAll}>Clear all filters</Button>}
          />
        ) : (
          <>
            <ProductGrid products={items} layout={viewMode} className="md:grid-cols-2 xl:grid-cols-3" />
            <Pagination
              className="mt-12"
              page={result.page}
              pageCount={result.pageCount}
              getHref={(page) => hrefFor({ ...query, page } satisfies ProductQuery)}
            />
          </>
        )}
      </section>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left" title="Filters" className="max-w-sm">
        <div className="flex-1 overflow-y-auto p-6">{filters}</div>
        <div className="grid grid-cols-2 gap-3 border-t border-border p-4">
          <Button variant="outline" onClick={clearAll}>
            Clear all
          </Button>
          <Button onClick={() => setFiltersOpen(false)}>Show {result.total} results</Button>
        </div>
      </Drawer>
    </div>
  );
}
