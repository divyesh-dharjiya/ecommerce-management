"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { LiveDot, ProductImage, buttonClasses } from "@/components/ui";

/** The hero shot: a full-bleed studio photo. */
const HERO_PRODUCT_ID = "prd_pz_38";
/** Three supporting picks shown beneath the headline. */
const SPOTLIGHT_IDS = ["prd_pz_02", "prd_0088", "prd_pz_19"];

/**
 * Full-bleed split hero, marketplace-style: a giant condensed headline on
 * black beside an edge-to-edge product photo. No entrance animation — the
 * headline is the LCP element and should paint immediately.
 */
export function Hero() {
  const products = useCatalogStore((s) => s.products);
  const hero = products.find((p) => p.id === HERO_PRODUCT_ID);
  const spotlight = SPOTLIGHT_IDS.flatMap((id) => products.find((p) => p.id === id) ?? []);

  return (
    <section className="grid grid-cols-1 bg-[#111] text-white lg:grid-cols-2" aria-labelledby="hero-title">
      <div className="flex flex-col justify-between gap-10 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div>
          <p className="eyebrow inline-flex items-center gap-2.5 text-white/70">
            <LiveDot /> New season · Just dropped
          </p>
          <h1 id="hero-title" className="mt-6 font-display text-[clamp(3.75rem,10vw,9rem)]">
            Move
            <br />
            different<span className="text-accent">.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/75">
            250+ drops across sneakers, streetwear, tech and home — from the brands everyone&apos;s wearing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products?sort=newest"
              className={buttonClasses("primary", "lg", "bg-white text-[#111] hover:bg-white/90")}
            >
              Shop new arrivals
            </Link>
            <Link
              href="/products?onSale=1&sort=discount"
              className={buttonClasses(
                "outline",
                "lg",
                "border-white/40 bg-transparent text-white hover:bg-white hover:text-[#111]",
              )}
            >
              Shop the sale
            </Link>
          </div>
        </div>

        {spotlight.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Trending now">
            {spotlight.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-white/[0.06]">
                    <ProductImage
                      src={p.thumbnail}
                      alt={p.title}
                      fill
                      sizes="(max-width: 1024px) 30vw, 14vw"
                      className={`${p.imageStyle === "photo" ? "object-cover" : "object-contain p-3"} transition-transform duration-500 group-hover:scale-105`}
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-white/80">{p.title}</p>
                  <p className="text-xs text-white/50">{formatPrice(p.price)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hero && (
        <Link
          href={`/products/${hero.slug}`}
          className="group relative block min-h-[420px] overflow-hidden lg:min-h-[640px]"
          aria-label={`${hero.title} — ${formatPrice(hero.price)}`}
        >
          <ProductImage
            src={hero.thumbnail}
            alt={hero.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-full bg-white py-2 pl-5 pr-2 text-[#111] sm:inset-x-6 sm:bottom-6">
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{hero.title}</span>
              <span className="text-xs text-[#707072]">{formatPrice(hero.price)}</span>
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#111] text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-4" />
            </span>
          </div>
        </Link>
      )}
    </section>
  );
}
