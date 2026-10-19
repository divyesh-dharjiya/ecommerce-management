"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Heart, RotateCcw, Share2, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { commerceConfig } from "@/config/site";
import { useNow } from "@/hooks";
import { formatDate, formatNumber } from "@/lib/format";
import { spring } from "@/lib/motion";
import { cn, discountPercent } from "@/lib/utils";
import { useHydrated } from "@/store/ui-store";
import { useCartActions } from "@/features/cart/hooks/use-cart-actions";
import { useIsWishlisted } from "@/features/wishlist/store/wishlist-store";
import { viewersFor } from "@/features/live/services/simulation";
import { Badge, Button, LiveDot, QuantityStepper, Rating } from "@/components/ui";
import { Price } from "@/features/catalog/components/price";
import { StockMeter } from "@/features/catalog/components/product-detail/stock-meter";
import type { Product } from "@/types";

function LiveViewers({ productId }: { productId: string }) {
  const hydrated = useHydrated();
  const now = useNow(15_000);
  if (!hydrated) return <p className="mt-5 h-5" aria-hidden />;
  return (
    <p className="mt-5 flex animate-fade-in items-center gap-2 text-sm">
      <LiveDot />
      <Eye className="size-4 text-muted-foreground" />
      <span>
        <strong>{viewersFor(productId, now)}</strong> people are viewing this right now
      </span>
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
    { icon: Truck, title: "Get it by", body: delivery },
    { icon: RotateCcw, title: "Returns", body: product.returnPolicy ?? "30 days return policy" },
    { icon: ShieldCheck, title: "Warranty", body: product.warranty ?? "1 year warranty" },
  ];
  return (
    <ul className="mt-8 grid grid-cols-1 gap-3 rounded-xl border border-border p-5 text-sm sm:grid-cols-3">
      {perks.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex items-start gap-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-accent" />
          <span>
            <strong className="block">{title}</strong>
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

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  };

  const buyNow = () => {
    if (addToCart(product, qty, { openDrawer: false })) router.push("/checkout");
  };

  return (
    <div className="flex min-w-0 animate-fade-up flex-col [animation-delay:60ms]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{product.brand}</Badge>
        {off > 0 && <Badge tone="sale">-{off}% OFF</Badge>}
        {product.isNew && <Badge tone="solid">New arrival</Badge>}
      </div>
      <h1 className="mt-4 font-display text-3xl leading-tight tracking-tight sm:text-4xl">{product.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Rating value={product.rating} showValue count={product.reviewCount} size={16} />
        <span className="text-sm text-muted-foreground">{formatNumber(product.soldCount)} sold</span>
      </div>

      <Price className="mt-6" price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
      <p className="mt-1 text-xs text-muted-foreground">
        Inclusive of all taxes · Free shipping over ${commerceConfig.freeShippingThreshold}
      </p>

      <LiveViewers productId={product.id} />
      <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>
      <div className="mt-6">
        <StockMeter stock={product.stock} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} max={max} />
        <Button size="lg" className="flex-1" disabled={soldOut} onClick={() => addToCart(product, qty)}>
          <ShoppingBag className="size-5" /> Add to bag
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="size-13 rounded-lg"
          onClick={() => toggleWish(product)}
          aria-label="Toggle wishlist"
          aria-pressed={wished}
        >
          <motion.span key={String(wished)} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={spring.bouncy}>
            <Heart className={cn("size-5", wished && "fill-accent text-accent")} />
          </motion.span>
        </Button>
        <Button size="icon" variant="outline" className="size-13 rounded-lg" onClick={share} aria-label="Share">
          <Share2 className="size-5" />
        </Button>
      </div>
      <Button size="lg" variant="dark" className="mt-3 w-full" disabled={soldOut} onClick={buyNow}>
        Buy it now
      </Button>

      <Perks product={product} />
    </div>
  );
}
