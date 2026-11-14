"use client";

import Link from "next/link";
import { memo } from "react";
import { Eye, Heart, ShoppingCart } from "lucide-react";
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

/**
 * Product card: picture, name, rating, price and one clear "Add to cart"
 * button. Every action is visible without hovering, so it works the same on
 * touch screens.
 */
function ProductCardBase({ product, priority, layout = "grid", className, style }: ProductCardProps) {
  const { addToCart, toggleWish } = useCartActions();
  const wished = useIsWishlisted(product.id);
  const openQuickView = useUiStore((s) => s.setQuickViewId);
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= commerceConfig.lowStockThreshold;
  const href = `/products/${product.slug}`;
  const isList = layout === "list";
  // Studio photos fill the tile; transparent cut-outs sit padded on the tint.
  const fit = product.imageStyle === "photo" ? "object-cover" : "object-contain p-[12%]";

  return (
    <article
      style={style}
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lift",
        isList ? "flex-row" : "flex-col",
        className,
      )}
    >
      <div className={cn("relative shrink-0 overflow-hidden bg-muted", isList ? "w-36 sm:w-52" : "aspect-square")}>
        <Link href={href} aria-label={product.title} className="absolute inset-0" tabIndex={-1}>
          <ProductImage
            src={product.thumbnail}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              fit,
              "transition-transform duration-500 group-hover:scale-105",
              soldOut && "opacity-50 grayscale",
            )}
          />
        </Link>

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {off > 0 && <Badge tone="sale">{off}% off</Badge>}
          {product.isNew && off === 0 && <Badge tone="primary">New</Badge>}
        </div>

        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => toggleWish(product)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            className="grid size-8 place-items-center rounded-full bg-card/95 text-foreground shadow-soft transition hover:text-accent"
          >
            <Heart className={cn("size-4", wished && "fill-accent text-accent")} />
          </button>
          <button
            type="button"
            onClick={() => openQuickView(product.id)}
            aria-label={`Quick look at ${product.title}`}
            className="grid size-8 place-items-center rounded-full bg-card/95 text-foreground opacity-0 shadow-soft transition group-hover:opacity-100 focus-visible:opacity-100 hover:text-primary max-md:hidden"
          >
            <Eye className="size-4" />
          </button>
        </div>
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col p-3 sm:p-4", isList && "justify-center")}>
        <p className="truncate text-xs font-medium text-muted-foreground">{product.brand}</p>
        <h3 className={cn("mt-0.5 line-clamp-2 font-medium leading-snug", isList ? "text-base sm:text-lg" : "text-sm")}>
          <Link href={href} className="transition-colors hover:text-primary">
            {product.title}
          </Link>
        </h3>
        {product.reviewCount > 0 && (
          <Rating className="mt-1.5" value={product.rating} showValue count={product.reviewCount} size={12} />
        )}
        {isList && (
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-muted-foreground max-sm:hidden">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-2.5">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          {(soldOut || lowStock) && (
            <p className={cn("mt-0.5 text-xs font-medium", soldOut ? "text-muted-foreground" : "text-warning")}>
              {soldOut ? "Out of stock" : `Only ${product.stock} left`}
            </p>
          )}
          <button
            type="button"
            disabled={soldOut}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.title} to cart`}
            className={cn(
              "mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:border-border disabled:bg-muted disabled:text-muted-foreground",
              isList && "sm:w-auto sm:px-5",
            )}
          >
            <ShoppingCart className="size-4" /> {soldOut ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-4 w-1/4 rounded" />
        <div className="skeleton mt-3 h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}
