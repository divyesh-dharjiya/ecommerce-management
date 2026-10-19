"use client";

import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDailyCountdown } from "@/hooks";
import { discountPercent } from "@/lib/utils";
import { useHydrated } from "@/store/ui-store";
import { sortProducts } from "@/features/catalog/services/catalog";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Container } from "@/components/ui";

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-16 flex-col items-center bg-[#111] px-3 py-2 text-white">
      <span className="font-display text-4xl tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/60">{label}</span>
    </div>
  );
}

/** Red sale banner with a live countdown, then a scrollable row of deals. */
export function FlashDeals() {
  const products = useCatalogStore((s) => s.products);
  const hydrated = useHydrated();
  const { hours, minutes, seconds } = useDailyCountdown();
  const scroller = useRef<HTMLDivElement>(null);

  const deals = useMemo(
    () =>
      sortProducts(
        products.filter(
          (p) => p.status === "active" && p.stock > 0 && discountPercent(p.price, p.compareAtPrice) >= 10,
        ),
        "discount",
      ).slice(0, 12),
    [products],
  );

  const scroll = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="py-14" aria-labelledby="flash-title">
      <div className="bg-accent text-accent-foreground">
        <Container className="flex flex-wrap items-center justify-between gap-6 py-8 sm:py-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Today only</p>
            <h2 id="flash-title" className="mt-2 font-display text-6xl sm:text-8xl">
              Flash sale
            </h2>
            <p className="mt-2 text-lg font-medium">Up to 20% off. Ends at midnight.</p>
          </div>
          <div className="flex items-center gap-2" role="timer" aria-label="Time remaining" suppressHydrationWarning>
            {hydrated && (
              <>
                <TimeUnit value={hours} label="Hrs" />
                <TimeUnit value={minutes} label="Min" />
                <TimeUnit value={seconds} label="Sec" />
              </>
            )}
          </div>
        </Container>
      </div>

      <Container className="mt-8">
        <div
          ref={scroller}
          className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 scrollbar-none sm:gap-3"
        >
          {deals.map((p) => (
            <div key={p.id} className="w-[220px] shrink-0 snap-start sm:w-[280px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => scroll(d)}
              aria-label={d < 0 ? "Previous deals" : "Next deals"}
              className="grid size-12 place-items-center rounded-full bg-muted transition hover:bg-border"
            >
              {d < 0 ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
