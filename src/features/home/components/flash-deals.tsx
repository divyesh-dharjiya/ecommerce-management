"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useDailyCountdown } from "@/hooks";
import { discountPercent } from "@/lib/utils";
import { useHydrated } from "@/store/ui-store";
import { sortProducts } from "@/features/catalog/services/catalog";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Container } from "@/components/ui";

const pad = (n: number) => String(n).padStart(2, "0");

/** Today's biggest discounts, with a small countdown to midnight. */
export function FlashDeals() {
  const products = useCatalogStore((s) => s.products);
  const hydrated = useHydrated();
  const { hours, minutes, seconds } = useDailyCountdown();

  const deals = useMemo(
    () =>
      sortProducts(
        products.filter(
          (p) => p.status === "active" && p.stock > 0 && discountPercent(p.price, p.compareAtPrice) >= 10,
        ),
        "discount",
      ).slice(0, 4),
    [products],
  );
  // Deals are sorted by discount, so the first one sets the headline figure.
  const top = deals[0];
  if (!top) return null;
  const maxOff = discountPercent(top.price, top.compareAtPrice);

  return (
    <section className="py-12" aria-labelledby="deals-title">
      <Container>
        <div className="rounded-3xl border border-accent/20 bg-accent/[0.04] p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="deals-title" className="font-display text-2xl sm:text-3xl">
                Today&apos;s deals
              </h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Save up to <strong className="text-accent">{maxOff}%</strong> on popular items.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p
                className="inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm shadow-soft"
                role="timer"
                aria-label="Time left on today's deals"
                suppressHydrationWarning
              >
                <Clock className="size-4 text-accent" />
                <span className="text-muted-foreground">Ends in</span>
                <span className="font-semibold tabular-nums">
                  {hydrated ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : "--:--:--"}
                </span>
              </p>
              <Link
                href="/products?onSale=1&sort=discount"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                See all deals <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <ProductGrid products={deals} priorityCount={0} />
        </div>
      </Container>
    </section>
  );
}
