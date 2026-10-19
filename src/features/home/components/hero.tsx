"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { formatPrice, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useHydrated, useUiStore } from "@/store/ui-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, LiveDot, ProductImage, buttonClasses } from "@/components/ui";

/** Mosaic tiles: a tall hero shot plus two supporting products, each on a soft tint. */
const MOSAIC = [
  { id: "prd_0088", tint: "bg-sand", span: "row-span-2", aspect: "aspect-[3/4.2]", delay: 120 },
  { id: "prd_0101", tint: "bg-sage", span: "", aspect: "aspect-square", delay: 220 },
  { id: "prd_0008", tint: "bg-blush", span: "", aspect: "aspect-square", delay: 320 },
];

const TRUST = [
  { icon: Truck, label: "Free shipping over $100" },
  { icon: RotateCcw, label: "30-day returns" },
  { icon: ShieldCheck, label: "Secure checkout" },
];

/** Staggered CSS entrance — plays on first paint, no hydration wait (better LCP). */
const enter = (ms: number) => ({ className: "animate-fade-up", style: { animationDelay: `${ms}ms` } });

function LiveStatus() {
  const hydrated = useHydrated();
  const count = useUiStore((s) => s.liveEvents.filter((e) => e.kind === "purchase").length);
  return (
    <p className="eyebrow inline-flex items-center gap-2.5 text-muted-foreground">
      <LiveDot />
      {hydrated && count > 0
        ? `${pluralize(count, "order")} placed while you've been here`
        : "Live store — orders arriving now"}
    </p>
  );
}

function Mosaic() {
  const products = useCatalogStore((s) => s.products);
  const tiles = MOSAIC.flatMap((m) => {
    const product = products.find((p) => p.id === m.id);
    return product ? [{ ...m, product }] : [];
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Featured products">
      {tiles.map(({ product, tint, span, aspect, delay }) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          style={{ animationDelay: `${delay}ms` }}
          className={cn("group relative animate-scale-in overflow-hidden rounded-xl", tint, span, aspect)}
        >
          <ProductImage
            src={product.thumbnail}
            alt={product.title}
            fill
            priority
            sizes="(max-width: 1024px) 45vw, 26vw"
            className="object-contain p-7 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
          />
          <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-md bg-card/90 px-3 py-2 text-xs backdrop-blur">
            <span className="truncate font-medium">{product.title}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{formatPrice(product.price)}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="border-b border-border" aria-labelledby="hero-title">
      <Container className="grid grid-cols-1 items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <div {...enter(0)}>
            <LiveStatus />
          </div>
          <h1
            id="hero-title"
            {...enter(80)}
            className="mt-6 animate-fade-up font-display text-[3.4rem] leading-[0.95] sm:text-7xl xl:text-[5.75rem]"
          >
            Everyday things,
            <br />
            <em className="text-accent">beautifully</em> chosen.
          </h1>
          <p {...enter(160)} className="mt-7 max-w-md animate-fade-up text-lg leading-relaxed text-muted-foreground">
            A considered edit of 100+ products across tech, fashion, beauty and home — from the brands worth knowing,
            delivered in days.
          </p>
          <div {...enter(240)} className="mt-9 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/products" className={buttonClasses("primary", "lg", "group")}>
              Shop the collection{" "}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products?onSale=1&sort=discount"
              className="text-sm font-semibold underline underline-offset-[6px] decoration-border transition hover:decoration-foreground"
            >
              See today&apos;s deals
            </Link>
          </div>
          <ul
            {...enter(320)}
            className="mt-12 flex animate-fade-up flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6 text-sm text-muted-foreground"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-foreground" aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </div>
        <Mosaic />
      </Container>
    </section>
  );
}
