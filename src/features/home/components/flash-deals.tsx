"use client";

import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useDailyCountdown } from "@/hooks";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useHydrated } from "@/store/ui-store";
import { sortProducts } from "@/features/catalog/services/catalog";
import { discountPercent } from "@/lib/utils";
import { Container } from "@/components/ui";
import { ProductCard } from "@/features/catalog/components/product-card";

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 font-mono text-xl font-bold tabular-nums backdrop-blur">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );
}

export function FlashDeals() {
  const products = useCatalogStore((s) => s.products);
  const hydrated = useHydrated();
  const { hours, minutes, seconds } = useDailyCountdown();
  const scroller = useRef<HTMLDivElement>(null);

  const deals = useMemo(
    () =>
      sortProducts(
        products.filter((p) => p.status === "active" && p.stock > 0 && discountPercent(p.price, p.compareAtPrice) >= 10),
        "discount",
      ).slice(0, 12),
    [products],
  );

  const scroll = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="py-12">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-500 via-fuchsia-600 to-primary p-6 text-white sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em]">
                <Zap className="size-4 fill-current" /> Flash deals
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Up to 20% off — today only</h2>
            </div>
            <div className="flex items-center gap-2" aria-label="Time remaining" suppressHydrationWarning>
              {hydrated && (
                <>
                  <TimeBox value={hours} label="hrs" />
                  <span className="pb-5 text-xl font-bold">:</span>
                  <TimeBox value={minutes} label="min" />
                  <span className="pb-5 text-xl font-bold">:</span>
                  <TimeBox value={seconds} label="sec" />
                </>
              )}
            </div>
          </div>

          <div className="relative mt-8">
            <div ref={scroller} className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2 scrollbar-none">
              {deals.map((p) => (
                <div key={p.id} className="w-[220px] shrink-0 snap-start text-foreground sm:w-[260px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => scroll(d)}
                  aria-label={d < 0 ? "Previous deals" : "Next deals"}
                  className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
                >
                  {d < 0 ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
