"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, ProductImage } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const TILES = [
  {
    href: "/categories/laptops",
    eyebrow: "Work from anywhere",
    title: "Pro laptops",
    productId: "prd_0078",
    className: "lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white",
    imageClass: "right-[-6%] bottom-[-4%] w-[70%] h-[70%]",
  },
  {
    href: "/categories/fragrances",
    eyebrow: "Signature scents",
    title: "Fragrances",
    productId: "prd_0007",
    className: "bg-gradient-to-br from-rose-100 to-amber-100 text-slate-900 dark:from-rose-950 dark:to-amber-950 dark:text-white",
    imageClass: "right-2 bottom-2 w-1/2 h-3/4",
  },
  {
    href: "/categories/mens-watches",
    eyebrow: "Timeless",
    title: "Luxury watches",
    productId: "prd_0094",
    className: "bg-gradient-to-br from-emerald-100 to-teal-100 text-slate-900 dark:from-emerald-950 dark:to-teal-950 dark:text-white",
    imageClass: "right-2 bottom-2 w-1/2 h-3/4",
  },
];

export function PromoBento() {
  const products = useCatalogStore((s) => s.products);
  return (
    <section className="py-12" aria-label="Featured collections">
      <Container>
        <Stagger step={0.1} className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t) => {
            const product = products.find((p) => p.id === t.productId);
            return (
              <StaggerItem key={t.href} variant="scaleIn" className={`group relative overflow-hidden rounded-[2rem] ${t.className}`}>
                <Link href={t.href} className="absolute inset-0 z-10 p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">{t.eyebrow}</p>
                  <h3 className="mt-2 font-display text-3xl font-bold">{t.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 group-hover:underline">
                    Shop now <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
                {product && (
                  <div className={`absolute transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-2 group-hover:scale-110 ${t.imageClass}`}>
                    <ProductImage src={product.thumbnail} alt="" fill sizes="(max-width: 1024px) 50vw, 40vw" className="object-contain drop-shadow-2xl" />
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
