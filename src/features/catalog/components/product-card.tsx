"use client";

import Link from "next/link";
import { memo } from "react";
import { Eye, Heart, Plus } from "lucide-react";
import { commerceConfig } from "@/config/site";
import { cn, discountPercent } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useCartActions } from "@/features/cart/hooks/use-cart-actions";
import { useIsWishlisted } from "@/features/wishlist/store/wishlist-store";
import { Badge, ProductImage, Rating } from "@/components/ui";
import { Price } from "@/features/catalog/components/price";
import type { Product } from "@/types";

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
  layout?: "grid" | "list";
  className?: string;
  style?: React.CSSProperties;
}

/** Icon action shown over the product image (wishlist, quick view). */
function MediaAction({ label, onClick, pressed, className, children }: { label: string; onClick: () => void; pressed?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={cn("glass grid size-9 place-items-center rounded-full transition duration-300 hover:scale-110 active:scale-90", className)}
    >
      {children}
    </button>
  );
}

function ProductCardBase({ product, priority, layout = "grid", className, style }: ProductCardProps) {
  const { addToCart, toggleWish } = useCartActions();
  const wished = useIsWishlisted(product.id);
  const openQuickView = useUiStore((s) => s.setQuickViewId);
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= commerceConfig.lowStockThreshold;
  const hoverImage = product.images.find((i) => i !== product.thumbnail);
  const href = `/products/${product.slug}`;
  const isList = layout === "list";

  return (
    <article
      style={style}
      className={cn(
        "group relative flex overflow-hidden rounded-3xl border border-border/70 bg-card transition-[box-shadow,transform,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-border hover:shadow-lift",
        isList ? "flex-row" : "flex-col",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden bg-gradient-to-br from-muted to-muted/40", isList ? "aspect-square w-40 shrink-0 sm:w-56" : "aspect-[4/4.2]")}>
        <Link href={href} aria-label={product.title} className="absolute inset-0" tabIndex={-1}>
          <ProductImage
            src={product.thumbnail}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-contain p-4 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110",
              hoverImage && "group-hover:opacity-0",
              soldOut && "grayscale",
            )}
          />
          {hoverImage && (
            <ProductImage
              src={hoverImage}
              alt=""
              fill
              shimmer={false}
              sizes="(max-width: 640px) 50vw, 25vw"
              className="!opacity-0 object-contain p-4 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:!opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && <Badge tone="sale">-{off}%</Badge>}
          {product.isNew && <Badge tone="solid">New</Badge>}
          {soldOut && <Badge tone="danger">Sold out</Badge>}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <MediaAction label={wished ? "Remove from wishlist" : "Add to wishlist"} pressed={wished} onClick={() => toggleWish(product)}>
            <Heart className={cn("size-4 transition", wished ? "fill-rose-500 text-rose-500" : "text-foreground/70")} />
          </MediaAction>
          <MediaAction
            label={`Quick view ${product.title}`}
            onClick={() => openQuickView(product.id)}
            className="translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100 max-sm:hidden"
          >
            <Eye className="size-4 text-foreground/70" />
          </MediaAction>
        </div>

        {!isList && (
          <div className="absolute inset-x-3 bottom-3 translate-y-[140%] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-focus-within:translate-y-0 max-sm:hidden">
            <button
              type="button"
              disabled={soldOut}
              onClick={() => addToCart(product)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-sm font-semibold text-background shadow-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              <Plus className="size-4" /> {soldOut ? "Sold out" : "Quick add"}
            </button>
          </div>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col gap-1.5 p-4", isList && "justify-center sm:p-6")}>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          {lowStock && <span className="shrink-0 text-[11px] font-semibold text-amber-600 dark:text-amber-400">Only {product.stock} left</span>}
        </div>
        <h3 className="line-clamp-2 font-semibold leading-snug">
          <Link href={href} className="transition-colors hover:text-primary">
            {product.title}
          </Link>
        </h3>
        {isList && <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}
        <Rating value={product.rating} count={product.reviewCount} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          <button
            type="button"
            disabled={soldOut}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.title} to bag`}
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:brightness-110 active:scale-90 disabled:opacity-50",
              !isList && "sm:hidden",
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card" aria-hidden>
      <div className="skeleton aspect-[4/4.2]" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/4 rounded" />
      </div>
    </div>
  );
}
