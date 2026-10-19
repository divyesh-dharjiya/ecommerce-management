"use client";

import { create } from "zustand";
import type { LiveEvent } from "@/types";
import { liveConfig } from "@/config/site";

/** Ephemeral UI + realtime state. Intentionally NOT persisted. */
interface UiState {
  hydrated: boolean;
  cartOpen: boolean;
  searchOpen: boolean;
  quickViewId: string | null;
  mobileNavOpen: boolean;
  liveEvents: LiveEvent[];
  setHydrated: () => void;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuickViewId: (id: string | null) => void;
  setMobileNavOpen: (open: boolean) => void;
  pushLiveEvent: (event: LiveEvent) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  hydrated: false,
  cartOpen: false,
  searchOpen: false,
  quickViewId: null,
  mobileNavOpen: false,
  liveEvents: [],
  setHydrated: () => set({ hydrated: true }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setQuickViewId: (quickViewId) => set({ quickViewId }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  pushLiveEvent: (event) =>
    set((s) => ({ liveEvents: [event, ...s.liveEvents].slice(0, liveConfig.maxEvents) })),
}));

export const useHydrated = () => useUiStore((s) => s.hydrated);
