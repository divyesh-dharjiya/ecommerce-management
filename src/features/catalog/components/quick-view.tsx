"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Heart, ShoppingBag, Truck } from "lucide-react";
import { commerceConfig } from "@/config/site";
import { useCartActions } from "@/features/cart/hooks/use-cart-actions";
import { useRetained } from "@/hooks";
import { cn } from "@/lib/utils";
import { useProduct } from "@/features/catalog/store/catalog-store";
import { useUiStore } from "@/store/ui-store";
import { useIsWishlisted } from "@/features/wishlist/store/wishlist-store";
import { Badge, Button, Modal, ProductImage, QuantityStepper, Rating } from "@/components/ui";
import { Price } from "@/features/catalog/components/price";
import type { Product } from "@/types";

export function QuickView() {
  const id = useUiStore((s) => s.quickViewId);
  const close = useUiStore((s) => s.setQuickViewId);
  const current = useProduct(id ?? undefined);
  const product = useRetained(current);

  return (
    <Modal open={!!current} onClose={() => close(null)} className="max-w-4xl">
      {/* `key` resets internal state (selected image, qty) per product */}
      {product && <QuickViewBody key={product.id} product={product} onClose={() => close(null)} />}
    </Modal>
  );
}

function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const [image, setImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWish } = useCartActions();
  const wished = useIsWishlisted(product.id);
  const max = Math.min(product.stock, commerceConfig.maxQuantityPerItem);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="bg-gradient-to-br from-muted to-muted/30 p-6">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <ProductImage
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 90vw, 440px"
            className="object-contain"
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none">
            {product.images.slice(0, 5).map((img) => (
              <button
                key={img}
                type="button"
                onClick={() => setImage(img)}
                aria-label="Show image"
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-md border-2 bg-card transition",
                  image === img ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <ProductImage src={img} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Badge tone="primary">{product.brand}</Badge>
          {product.stock > 0 ? <Badge tone="success">In stock</Badge> : <Badge tone="danger">Sold out</Badge>}
        </div>
        <h2 className="text-2xl font-bold leading-tight tracking-tight">{product.title}</h2>
        <Rating value={product.rating} showValue count={product.reviewCount} size={16} />
        <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="size-4 text-accent" /> {product.shipping ?? "Ships in 2–3 business days"}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, max)} />
          <Button className="flex-1" disabled={product.stock <= 0} onClick={() => addToCart(product, qty) && onClose()}>
            <ShoppingBag className="size-4" /> Add to bag
          </Button>
          <Button variant="outline" size="icon" onClick={() => toggleWish(product)} aria-label="Toggle wishlist">
            <Heart className={cn("size-4", wished && "fill-accent text-accent")} />
          </Button>
        </div>
        <Link
          href={`/products/${product.slug}`}
          onClick={onClose}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-accent"
        >
          View full details <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
