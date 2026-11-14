"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistOptions } from "@/lib/storage";

export type ViewMode = "grid" | "list";

interface PreferencesState {
  liveSimulation: boolean;
  liveToasts: boolean;
  viewMode: ViewMode;
  setLiveSimulation: (on: boolean) => void;
  setLiveToasts: (on: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      liveSimulation: true,
      // Storefront "someone just bought…" pop-ups are opt-in: they distract shoppers.
      liveToasts: false,
      viewMode: "grid",
      setLiveSimulation: (liveSimulation) => set({ liveSimulation }),
      setLiveToasts: (liveToasts) => set({ liveToasts }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    persistOptions<PreferencesState>("preferences", {
      version: 2,
      // v2 turned purchase pop-ups off by default; reset saved v1 preferences once.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<PreferencesState>;
        return (version < 2 ? { ...state, liveToasts: false } : state) as PreferencesState;
      },
    }),
  ),
);
