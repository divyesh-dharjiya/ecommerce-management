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

/** Round icon action over the product tile (wishlist, quick view). */
function TileAction({
  label,
  onClick,
  pressed,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-card/90 text-foreground shadow-soft backdrop-blur transition duration-300 hover:scale-110 active:scale-90",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Editorial product card: no frame, just a soft tile for the photo and clean
 * type beneath. The second image crossfades in on hover; quick-add slides up.
 */
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
      className={cn("group relative flex", isList ? "flex-row gap-5 sm:gap-8" : "flex-col", className)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-muted",
          isList ? "aspect-square w-40 shrink-0 sm:w-56" : "aspect-[4/5]",
        )}
      >
        <Link href={href} aria-label={product.title} className="absolute inset-0" tabIndex={-1}>
          <ProductImage
            src={product.thumbnail}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-contain p-6 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105",
              hoverImage && "group-hover:opacity-0",
              soldOut && "opacity-50 grayscale",
            )}
          />
          {hoverImage && (
            <ProductImage
              src={hoverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain p-6 opacity-0 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && <Badge tone="sale">−{off}%</Badge>}
          {product.isNew && !off && <Badge tone="solid">New</Badge>}
          {soldOut && <Badge tone="neutral">Sold out</Badge>}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <TileAction
            label={wished ? "Remove from wishlist" : "Add to wishlist"}
            pressed={wished}
            onClick={() => toggleWish(product)}
          >
            <Heart className={cn("size-4 transition", wished && "fill-accent text-accent")} />
          </TileAction>
          <TileAction
            label={`Quick view ${product.title}`}
            onClick={() => openQuickView(product.id)}
            className="translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100 max-sm:hidden"
          >
            <Eye className="size-4" />
          </TileAction>
        </div>

        {!isList && (
          <div className="absolute inset-x-3 bottom-3 translate-y-[140%] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-focus-within:translate-y-0 max-sm:hidden">
            <button
              type="button"
              disabled={soldOut}
              onClick={() => addToCart(product)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              <Plus className="size-4" /> {soldOut ? "Sold out" : "Quick add"}
            </button>
          </div>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col", isList ? "justify-center gap-2" : "gap-1 pt-3")}>
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow truncate text-muted-foreground">{product.brand}</p>
          {lowStock && <span className="shrink-0 text-[11px] font-medium text-accent">Only {product.stock} left</span>}
        </div>
        <h3 className={cn("line-clamp-2 leading-snug", isList ? "font-display text-2xl" : "text-[15px] font-medium")}>
          <Link href={href} className="underline-offset-4 transition-colors hover:underline">
            {product.title}
          </Link>
        </h3>
        {isList && <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground">{product.description}</p>}
        <div className="mt-1 flex items-end justify-between gap-2">
          <div className="space-y-1.5">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
            <Rating value={product.rating} count={product.reviewCount} size={12} />
          </div>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.title} to bag`}
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full border border-border transition hover:bg-primary hover:text-primary-foreground active:scale-90 disabled:opacity-50",
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
    <div aria-hidden>
      <div className="skeleton aspect-[4/5] rounded-lg" />
      <div className="space-y-2 pt-3">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-4 w-1/4 rounded" />
      </div>
    </div>
  );
}
