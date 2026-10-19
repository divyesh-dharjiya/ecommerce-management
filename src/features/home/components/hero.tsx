"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { formatPrice, pluralize } from "@/lib/format";
import { useHydrated, useUiStore } from "@/store/ui-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { buttonClasses, Container, LiveDot, ProductImage } from "@/components/ui";

const SHOWCASE = [
  { id: "prd_0101", className: "left-[6%] top-[4%] size-40 sm:size-52", rotate: -8, delay: 150 },
  { id: "prd_0088", className: "right-[2%] top-[18%] size-44 sm:size-60", rotate: 10, delay: 250 },
  { id: "prd_0008", className: "bottom-[4%] left-[14%] size-36 sm:size-48", rotate: 6, delay: 350 },
  { id: "prd_0174", className: "bottom-[0%] right-[18%] size-32 sm:size-44", rotate: -6, delay: 450 },
];

const STATS = [
  { icon: Star, value: "4.8/5", label: "Avg. rating" },
  { icon: Truck, value: "48h", label: "Express delivery" },
  { icon: ShieldCheck, value: "30-day", label: "Free returns" },
];

/** Staggered CSS entrance — plays on first paint, no hydration wait (better LCP). */
const enter = (ms: number) => ({ className: "animate-fade-up", style: { animationDelay: `${ms}ms` } });

function LivePill() {
  const hydrated = useHydrated();
  const liveCount = useUiStore((s) => s.liveEvents.filter((e) => e.kind === "purchase").length);
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold">
      <LiveDot />
      {hydrated && liveCount > 0 ? `${pluralize(liveCount, "order")} placed while you've been here` : "Live store · orders streaming in"}
    </span>
  );
}

function Showcase() {
  const products = useCatalogStore((s) => s.products);
  const items = SHOWCASE.flatMap((s) => {
    const product = products.find((p) => p.id === s.id);
    return product ? [{ ...s, product }] : [];
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-label="Featured products">
      <div className="absolute inset-[12%] animate-scale-in rounded-full bg-gradient-to-br from-primary/30 via-fuchsia-500/20 to-accent/30" />
      <div className="absolute inset-[4%] animate-fade-in rounded-full border border-dashed border-primary/30 [animation-delay:200ms]" />
      {items.map(({ product, className, rotate, delay }) => (
        <div key={product.id} className={`absolute animate-scale-in ${className}`} style={{ animationDelay: `${delay}ms` }}>
          <Link
            href={`/products/${product.slug}`}
            className="glass group block size-full animate-float rounded-[2rem] p-3 shadow-lift transition-transform duration-500 ease-[var(--ease-out-expo)] hover:scale-105"
            style={{ ["--r" as string]: `${rotate}deg`, animationDelay: `${delay * 3}ms` }}
          >
            <div className="relative size-full">
              <ProductImage src={product.thumbnail} alt={product.title} fill priority sizes="240px" className="object-contain drop-shadow-xl" />
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background opacity-0 shadow-lg transition group-hover:opacity-100">
              {formatPrice(product.price)}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-32 -top-32 size-[520px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute -right-24 top-24 size-[440px] rounded-full bg-fuchsia-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 size-[380px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      <Container className="grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <div {...enter(0)}>
            <LivePill />
          </div>
          <h1 id="hero-title" {...enter(80)} className="mt-6 animate-fade-up font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
            Style that <span className="text-gradient animate-gradient">moves</span>
            <br /> with you.
          </h1>
          <p {...enter(160)} className="mt-6 max-w-lg animate-fade-up text-lg text-muted-foreground">
            Discover 100+ hand-picked products from the world&apos;s most-loved brands — tech, fashion, beauty and home, delivered in days.
          </p>
          <div {...enter(240)} className="mt-8 flex animate-fade-up flex-wrap gap-3">
            <Link href="/products" className={buttonClasses("primary", "lg", "group")}>
              Shop the collection <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/products?onSale=1&sort=discount" className={buttonClasses("outline", "lg")}>
              <Sparkles className="size-5 text-accent" /> Today&apos;s deals
            </Link>
          </div>
          <dl {...enter(320)} className="mt-12 grid max-w-md animate-fade-up grid-cols-3 gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd>
                  <Icon className="mb-2 size-5 text-primary" aria-hidden />
                  <span className="text-2xl font-bold tracking-tight">{value}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <Showcase />
      </Container>
    </section>
  );
}
