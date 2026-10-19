"use client";

import { useState } from "react";

/**
 * Keeps a list's order stable while its data changes in the background.
 *
 * Live updates (e.g. sold counts) would otherwise re-sort a "best selling"
 * grid every few seconds under the shopper's cursor. While `key` (the
 * query/sort) stays the same, previously seen items keep their position and
 * fresh data is swapped in place; new items are appended. A new `key`
 * accepts the incoming order as-is.
 */
export function useStableOrder<T>(items: T[], getId: (item: T) => string, key: string): T[] {
  const incoming = items.map(getId);
  const [memo, setMemo] = useState({ key, order: incoming });

  let order: string[];
  if (memo.key !== key) {
    order = incoming;
  } else {
    const present = new Set(incoming);
    const kept = memo.order.filter((id) => present.has(id));
    const keptSet = new Set(kept);
    order = [...kept, ...incoming.filter((id) => !keptSet.has(id))];
  }

  // "Adjust state during render" — React re-renders immediately, no effect needed.
  if (memo.key !== key || order.join() !== memo.order.join()) setMemo({ key, order });

  const byId = new Map(items.map((item) => [getId(item), item]));
  return order.map((id) => byId.get(id)!);
}
