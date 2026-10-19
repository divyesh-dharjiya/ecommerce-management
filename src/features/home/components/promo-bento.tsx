"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { Container, ProductImage } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const TILES = [
  {
    href: "/categories/laptops",
    eyebrow: "Work from anywhere",
    title: "Pro laptops",
    productId: "prd_0078",
    tint: "bg-sky",
    className: "sm:col-span-2 lg:row-span-2",
    image: "right-[-4%] bottom-[2%] h-[62%] w-[72%] lg:h-[70%]",
  },
  {
    href: "/categories/fragrances",
    eyebrow: "Signature scents",
    title: "Fragrances",
    productId: "prd_0007",
    tint: "bg-blush",
    className: "",
    image: "bottom-3 right-3 h-[68%] w-[34%]",
    compact: true,
  },
  {
    href: "/categories/mens-watches",
    eyebrow: "Timeless",
    title: "Watches",
    productId: "prd_0094",
    tint: "bg-sage",
    className: "",
    image: "bottom-3 right-3 h-[68%] w-[34%]",
    compact: true,
  },
];

export function PromoBento() {
  const products = useCatalogStore((s) => s.products);
  return (
    <section className="py-8" aria-label="Featured collections">
      <Container>
        <Stagger step={0.1} className="grid auto-rows-[260px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t) => {
            const product = products.find((p) => p.id === t.productId);
            return (
              <StaggerItem
                key={t.href}
                variant="scaleIn"
                className={cn("group relative overflow-hidden rounded-xl", t.tint, t.className)}
              >
                <Link href={t.href} className="absolute inset-0 z-10 flex flex-col justify-between p-7 sm:p-9">
                  <p className="eyebrow text-foreground/60">{t.eyebrow}</p>
                  <div>
                    <h3
                      className={cn(
                        "font-display leading-none",
                        "compact" in t ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl",
                      )}
                    >
                      {t.title}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 group-hover:underline">
                      Shop now{" "}
                      <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
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
                      className="object-contain"
                    />
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
