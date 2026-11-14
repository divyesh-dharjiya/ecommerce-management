"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Heart, RotateCcw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { commerceConfig } from "@/config/site";
import { useNow } from "@/hooks";
import { formatDate, formatNumber } from "@/lib/format";
import { cn, discountPercent } from "@/lib/utils";
import { useHydrated } from "@/store/ui-store";
import { useCartActions } from "@/features/cart/hooks/use-cart-actions";
import { useIsWishlisted } from "@/features/wishlist/store/wishlist-store";
import { Badge, Button, QuantityStepper, Rating } from "@/components/ui";
import { Price } from "@/features/catalog/components/price";
import type { Product } from "@/types";

function Availability({ stock }: { stock: number }) {
  if (stock <= 0) return <p className="text-sm font-semibold text-danger">Out of stock — back soon</p>;
  if (stock <= commerceConfig.lowStockThreshold)
    return <p className="text-sm font-semibold text-warning">Only {stock} left — order soon</p>;
  return (
    <p className="flex items-center gap-1.5 text-sm font-medium text-success">
      <Check className="size-4" /> In stock
    </p>
  );
}

function Perks({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const now = useNow(60_000);
  // Rendered after hydration so server and client dates can never disagree.
  const delivery = hydrated
    ? formatDate(new Date(now + 3 * 86_400_000).toISOString(), { weekday: "short", month: "short", day: "numeric" })
    : "in 2–3 days";
  const perks = [
    { icon: Truck, title: "Delivery", body: `Arrives by ${delivery}` },
    { icon: RotateCcw, title: "Returns", body: product.returnPolicy ?? "30 days return policy" },
    { icon: ShieldCheck, title: "Warranty", body: product.warranty ?? "1 year warranty" },
  ];
  return (
    <ul className="mt-6 divide-y divide-border rounded-2xl border border-border text-sm">
      {perks.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex items-center gap-3 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <span>
            <strong className="block font-semibold">{title}</strong>
            <span className="text-muted-foreground">{body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Title, price, stock and purchase actions for a product. */
export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, toggleWish } = useCartActions();
  const wished = useIsWishlisted(product.id);
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;
  const off = discountPercent(product.price, product.compareAtPrice);
  const max = Math.max(1, Math.min(product.stock, commerceConfig.maxQuantityPerItem));

  const buyNow = () => {
    if (addToCart(product, qty, { openDrawer: false })) router.push("/checkout");
  };

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-primary">{product.brand}</span>
        {off > 0 && <Badge tone="sale">{off}% off</Badge>}
        {product.isNew && <Badge tone="primary">New</Badge>}
      </div>
      <h1 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{product.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Rating value={product.rating} showValue count={product.reviewCount} size={16} />
        <span className="text-sm text-muted-foreground">{formatNumber(product.soldCount)} sold</span>
      </div>

      <div className="mt-5 rounded-2xl bg-subtle p-4 sm:p-5">
        <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
        <p className="mt-1 text-xs text-muted-foreground">
          Taxes included · Free delivery on orders over ${commerceConfig.freeShippingThreshold}
        </p>
        <div className="mt-3">
          <Availability stock={product.stock} />
        </div>
      </div>

      <p className="mt-5 line-clamp-3 leading-relaxed text-muted-foreground">{product.description}</p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">Quantity</p>
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} max={max} />
          <Button
            variant="outline"
            size="lg"
            className={cn("px-4", wished && "border-accent/40 text-accent")}
            onClick={() => toggleWish(product)}
            aria-pressed={wished}
          >
            <Heart className={cn("size-5", wished && "fill-accent text-accent")} />
            <span className="max-sm:sr-only">{wished ? "Saved" : "Save"}</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button size="lg" disabled={soldOut} onClick={() => addToCart(product, qty)}>
          <ShoppingCart className="size-5" /> Add to cart
        </Button>
        <Button size="lg" variant="dark" disabled={soldOut} onClick={buyNow}>
          Buy now
        </Button>
      </div>

      <Perks product={product} />
    </div>
  );
}
