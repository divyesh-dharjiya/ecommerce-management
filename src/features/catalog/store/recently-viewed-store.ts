"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions } from "@/lib/storage";

const LIMIT = 12;

interface RecentlyViewedState {
  ids: string[];
  track: (productId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      track: (productId) =>
        set((s) =>
          s.ids[0] === productId ? s : { ids: [productId, ...s.ids.filter((id) => id !== productId)].slice(0, LIMIT) },
        ),
    }),
    persistOptions<RecentlyViewedState>("recently-viewed", {
      version: 1,
      partialize: (s) => ({ ids: s.ids }),
    }),
  ),
);
