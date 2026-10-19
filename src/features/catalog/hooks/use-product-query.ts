"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseProductQuery, serializeProductQuery } from "@/features/catalog/services/query-params";
import type { ProductQuery } from "@/types";

/**
 * Reads and writes the product listing query in the URL.
 * `lockedCategory` comes from the route (/categories/[slug]) and is never
 * duplicated into the query string.
 */
export function useProductQuery(lockedCategory?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const query = useMemo<ProductQuery>(() => {
    const q = parseProductQuery(params);
    return lockedCategory ? { ...q, category: lockedCategory } : q;
  }, [params, lockedCategory]);

  /** Href for a query — used for crawlable links (pagination). */
  const hrefFor = useCallback(
    (next: ProductQuery) => {
      const qs = serializeProductQuery(lockedCategory ? { ...next, category: undefined } : next);
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, lockedCategory],
  );

  /** Merges a patch into the URL. Any filter change resets to page 1. */
  const update = useCallback(
    (patch: Partial<ProductQuery>) => {
      const next: ProductQuery = { ...query, ...patch };
      if (!("page" in patch)) next.page = undefined;
      router.replace(hrefFor(next), { scroll: false });
    },
    [query, hrefFor, router],
  );

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  return { query, update, reset, hrefFor };
}
