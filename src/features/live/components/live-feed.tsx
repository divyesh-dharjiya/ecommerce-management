"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useNow } from "@/hooks";
import { spring } from "@/lib/motion";
import { useUiStore } from "@/store/ui-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, LiveDot } from "@/components/ui";
import { Reveal } from "@/components/motion/reveal";
import { LiveEventRow } from "@/features/live/components/live-event-row";

/** Realtime stream of what other shoppers are buying right now. */
export function LiveFeed() {
  const allEvents = useUiStore((s) => s.liveEvents);
  const products = useCatalogStore((s) => s.products);
  const now = useNow(5000);
  const events = useMemo(() => allEvents.filter((e) => e.kind === "purchase").slice(0, 6), [allEvents]);
  const slugById = useMemo(() => new Map(products.map((p) => [p.id, p.slug])), [products]);

  return (
    <section className="py-12" aria-labelledby="live-feed-title">
      <Container>
        <Reveal className="grid grid-cols-1 gap-8 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <LiveDot /> Happening now
            </p>
            <h2 id="live-feed-title" className="mt-3 font-display text-3xl tracking-tight">
              Shoppers around the world
            </h2>
            <p className="mt-3 text-muted-foreground">
              A real-time stream of orders placed on Luxe. Stock levels and best-seller rankings update live across
              every open tab.
            </p>
          </div>
          <ul className="min-w-0 space-y-3" aria-live="polite">
            <AnimatePresence initial={false} mode="popLayout">
              {events.length === 0 && (
                <motion.li
                  key="waiting"
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground"
                >
                  <Activity className="size-4 animate-pulse" /> Listening for new orders…
                </motion.li>
              )}
              {events.map((e) => {
                const slug = slugById.get(e.productId);
                return (
                  <motion.li
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: -16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={spring.gentle}
                  >
                    <LiveEventRow event={e} now={now} href={slug ? `/products/${slug}` : "/products"} />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
