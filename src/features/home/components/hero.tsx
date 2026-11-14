"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, RotateCcw, Star, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/utils";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, ProductImage, buttonClasses } from "@/components/ui";

/** Four hand-picked products shown as a tidy grid beside the headline. */
const FEATURED_IDS = ["prd_pz_38", "prd_pz_02", "prd_0088", "prd_pz_19"];

/**
 * Simple, light hero: what the store is, two clear next steps, and real
 * products you can click straight away. No entrance animation — the headline
 * is the LCP element and should paint immediately.
 */
export function Hero() {
  const products = useCatalogStore((s) => s.products);
  const featured = FEATURED_IDS.flatMap((id) => products.find((p) => p.id === id) ?? []);
  const maxOff = useMemo(
    () => products.reduce((m, p) => Math.max(m, discountPercent(p.price, p.compareAtPrice)), 0),
    [products],
  );

  return (
    <section aria-labelledby="hero-title" className="pt-6 sm:pt-8">
      <Container>
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-subtle to-subtle p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:p-14">
          <div>
            {maxOff > 0 && (
              <Link
                href="/products?onSale=1&sort=discount"
                className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-accent shadow-soft transition hover:shadow-md"
              >
                Sale on now · up to {maxOff}% off
                <ArrowRight className="size-3.5" />
              </Link>
            )}
            <h1 id="hero-title" className="mt-5 font-display text-4xl sm:text-5xl lg:text-[3.5rem]">
              Everything you need, <span className="text-primary">all in one place.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
              Shop fashion, electronics, beauty and home essentials from brands you trust — with fast, free delivery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className={buttonClasses("primary", "lg")}>
                Start shopping <ArrowRight className="size-4" />
              </Link>
              <Link href="/categories" className={buttonClasses("outline", "lg")}>
                Browse categories
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" /> 4.8 average rating
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="size-4 text-primary" /> Free delivery over $100
              </li>
              <li className="flex items-center gap-1.5">
                <RotateCcw className="size-4 text-primary" /> 30-day returns
              </li>
            </ul>
          </div>

          {featured.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Featured products">
              {featured.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="group block overflow-hidden rounded-2xl bg-card shadow-soft transition hover:shadow-lift"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <ProductImage
                        src={p.thumbnail}
                        alt={p.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 45vw, 22vw"
                        className={`${p.imageStyle === "photo" ? "object-cover" : "object-contain p-4"} transition-transform duration-500 group-hover:scale-105`}
                      />
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-sm font-bold">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
