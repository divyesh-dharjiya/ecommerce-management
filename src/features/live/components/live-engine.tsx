"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { liveConfig } from "@/config/site";
import { createId } from "@/lib/utils";
import { usePreferencesStore } from "@/store/preferences-store";
import { useHydrated, useUiStore } from "@/store/ui-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import { simulatePurchase } from "@/features/live/services/simulation";
import { startLeaderElection } from "@/features/live/services/leader-election";
import { PurchaseToast } from "@/features/live/components/purchase-toast";
import type { LiveEvent } from "@/types";

const CHANNEL = "luxe-live";
// Social-proof toasts are a nudge, not a stream: rare, capped, and never on small screens.
const TOAST_COOLDOWN_MS = 45_000;
const TOAST_MAX_PER_VISIT = 3;
const TOAST_MIN_VIEWPORT = 768;

/** One simulation step: a purchase, plus occasional warehouse replenishment. */
function tickSimulation(): LiveEvent[] {
  const events: LiveEvent[] = [];
  const catalog = useCatalogStore.getState();
  const sim = simulatePurchase(catalog.products);
  if (sim) {
    useOrderStore.getState().ingestLiveOrder(sim.order);
    catalog.recordSales(Object.fromEntries(sim.order.lines.map((l) => [l.productId, l.quantity])));
    events.push(sim.event);
  }
  const depleted = useCatalogStore.getState().products.find((p) => p.status === "active" && p.stock < 3);
  if (depleted && Math.random() < 0.35) {
    const qty = 20 + Math.floor(Math.random() * 40);
    useCatalogStore.getState().adjustStock({ [depleted.id]: qty });
    events.push({
      id: createId("evt"),
      kind: "restock",
      productId: depleted.id,
      productTitle: depleted.title,
      thumbnail: depleted.thumbnail,
      quantity: qty,
      at: new Date().toISOString(),
    });
  }
  return events;
}

/**
 * Realtime commerce engine. One elected tab generates simulated activity;
 * events fan out to every tab over BroadcastChannel, while orders/stock sync
 * via persisted stores. Swap `tickSimulation` for a WebSocket/SSE
 * subscription to go live against a real backend — the UI won't change.
 */
export function LiveEngine() {
  const hydrated = useHydrated();
  const enabled = usePreferencesStore((s) => s.liveSimulation);
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const lastToastRef = useRef(0);
  const toastCountRef = useRef(0);

  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!hydrated || !enabled) return;

    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
    const election = startLeaderElection(createId("tab"));
    let timer: ReturnType<typeof setTimeout> | undefined;

    const maybeToast = (event: LiveEvent) => {
      const path = pathRef.current;
      const onStorefront = !path.startsWith("/admin") && !path.startsWith("/checkout");
      const now = Date.now();
      if (event.kind !== "purchase" || !onStorefront || !usePreferencesStore.getState().liveToasts) return;
      if (window.innerWidth < TOAST_MIN_VIEWPORT || toastCountRef.current >= TOAST_MAX_PER_VISIT) return;
      if (now - lastToastRef.current < TOAST_COOLDOWN_MS) return;
      lastToastRef.current = now;
      toastCountRef.current += 1;
      toast.custom(() => <PurchaseToast event={event} />, { duration: 5000, position: "bottom-left" });
    };

    const announce = (event: LiveEvent) => {
      useUiStore.getState().pushLiveEvent(event);
      maybeToast(event);
    };

    const loop = () => {
      if (election.isLeader()) {
        for (const event of tickSimulation()) {
          announce(event);
          channel?.postMessage(event);
        }
      }
      const { minIntervalMs, maxIntervalMs } = liveConfig;
      timer = setTimeout(loop, minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs));
    };

    if (channel) channel.onmessage = (e: MessageEvent<LiveEvent>) => announce(e.data);
    timer = setTimeout(loop, 2500);

    return () => {
      clearTimeout(timer);
      channel?.close();
      election.stop();
    };
  }, [hydrated, enabled]);

  return null;
}
