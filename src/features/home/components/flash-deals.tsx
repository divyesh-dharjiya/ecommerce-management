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
import { Reveal } from "@/components/motion/reveal";

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-14 flex-col items-center rounded-md border border-border px-2 py-2">
      <span className="font-mono text-2xl tabular-nums leading-none">{String(value).padStart(2, "0")}</span>
      <span className="eyebrow mt-2 text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * A dark, high-contrast band in both themes. The `dark` class scopes the dark
 * tokens to this section so every card inside renders correctly on it.
 */
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
    <section className="py-8" aria-labelledby="flash-title">
      <Container>
        <Reveal className="dark rounded-2xl bg-[#17150f] p-6 text-foreground sm:p-12">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="eyebrow text-accent">Flash deals</p>
              <h2 id="flash-title" className="mt-4 max-w-xl font-display text-5xl leading-[1.02] sm:text-6xl">
                Up to 20% off, <em>today only.</em>
              </h2>
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
          </div>

          <div className="mt-10">
            <div
              ref={scroller}
              className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2 scrollbar-none"
            >
              {deals.map((p) => (
                <div key={p.id} className="w-[200px] shrink-0 snap-start sm:w-[250px]">
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
                  className="grid size-11 place-items-center rounded-full border border-border transition hover:bg-foreground hover:text-background"
                >
                  {d < 0 ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
