"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, ProductImage } from "@/components/ui";

const TILES = [
  {
    href: "/categories/laptops",
    eyebrow: "Work from anywhere",
    title: "Pro laptops",
    cta: "Shop laptops",
    productId: "prd_0078",
    className: "bg-[#111] text-white sm:col-span-2 lg:row-span-2",
    image: "right-[-4%] bottom-[4%] h-[58%] w-[70%] lg:h-[64%]",
  },
  {
    href: "/categories/streetwear",
    eyebrow: "New drop",
    title: "Streetwear",
    cta: "Shop the drop",
    productId: "prd_pz_05",
    photo: true,
    className: "bg-muted text-white",
    image: "inset-0",
  },
  {
    href: "/categories/mens-watches",
    eyebrow: "Timeless",
    title: "Watches",
    cta: "Shop watches",
    productId: "prd_0094",
    className: "bg-accent text-white",
    image: "bottom-4 right-4 h-[70%] w-[38%]",
  },
];

/** Bold colour-blocked campaign tiles. */
export function PromoBento() {
  const products = useCatalogStore((s) => s.products);
  return (
    <section className="py-6" aria-label="Featured collections">
      <Container>
        <div className="grid auto-rows-[280px] grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {TILES.map((t) => {
            const product = products.find((p) => p.id === t.productId);
            return (
              <div key={t.href} className={cn("group relative overflow-hidden", t.className)}>
                {product && (
                  <div
                    className={cn(
                      "absolute transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105",
                      t.image,
                    )}
                  >
                    <ProductImage
                      src={product.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 60vw, 40vw"
                      className={t.photo ? "object-cover" : "object-contain"}
                    />
                  </div>
                )}
                {t.photo && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                )}
                <Link href={t.href} className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8">
                  <p className="text-sm font-semibold opacity-80">{t.eyebrow}</p>
                  {/* The large tile gets the big type; narrow tiles must fit "Streetwear" on one line. */}
                  <h3
                    className={cn(
                      "mt-1 font-display",
                      t.className.includes("row-span-2") ? "text-6xl sm:text-7xl" : "text-[2.75rem] xl:text-5xl",
                    )}
                  >
                    {t.title}
                  </h3>
                  <span
                    className={cn(
                      "mt-5 inline-flex w-fit rounded-full px-5 py-2.5 text-sm font-semibold transition",
                      "bg-white text-[#111] group-hover:bg-white/90",
                    )}
                  >
                    {t.cta}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
