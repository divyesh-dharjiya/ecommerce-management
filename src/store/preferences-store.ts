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
      liveToasts: true,
      viewMode: "grid",
      setLiveSimulation: (liveSimulation) => set({ liveSimulation }),
      setLiveToasts: (liveToasts) => set({ liveToasts }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    persistOptions<PreferencesState>("preferences", { version: 1 }),
  ),
);
