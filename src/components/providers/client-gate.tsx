"use client";

import type { ReactNode } from "react";
import { useHydrated } from "@/store/ui-store";

/**
 * Renders `fallback` until persisted stores have rehydrated from
 * localStorage. Use for views that depend purely on per-device data
 * (cart, orders, admin) where server output would be meaningless.
 */
export function ClientGate({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  return useHydrated() ? children : fallback;
}
