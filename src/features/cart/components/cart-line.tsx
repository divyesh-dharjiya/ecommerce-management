"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCartStore, type CartLine as CartLineData } from "@/features/cart/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { ProductImage, QuantityStepper } from "@/components/ui";
import { commerceConfig } from "@/config/site";

export function CartLine({ line, compact }: { line: CartLineData; compact?: boolean }) {
  const { item, product } = line;
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const closeCart = useUiStore((s) => s.setCartOpen);
  const max = Math.min(product.stock, commerceConfig.maxQuantityPerItem);
  const exceeds = item.quantity > product.stock;

  const remove = () => {
    const qty = item.quantity;
    removeItem(product.id);
    toast("Removed from bag", {
      description: product.title,
      action: { label: "Undo", onClick: () => addItem(product, qty) },
    });
  };

  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className={cn("flex gap-4 overflow-hidden", compact ? "py-4" : "py-6")}
    >
      <Link
        href={`/products/${product.slug}`}
        onClick={() => closeCart(false)}
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg bg-muted",
          compact ? "size-20" : "size-24 sm:size-28",
        )}
      >
        <ProductImage src={product.thumbnail} alt={product.title} fill sizes="112px" className="object-contain p-2" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${product.slug}`}
              onClick={() => closeCart(false)}
              className="line-clamp-2 text-sm font-semibold leading-snug hover:text-accent"
            >
              {product.title}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}</p>
          </div>
          <p className="shrink-0 font-semibold">{formatPrice(product.price * item.quantity)}</p>
        </div>
        {exceeds && (
          <p className="mt-1 text-xs font-medium text-danger">Only {product.stock} left — please reduce quantity.</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.max(max, 1)}
            onChange={(q) => setQuantity(product.id, q, product.stock)}
          />
          <button
            type="button"
            onClick={remove}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-danger"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      </div>
    </m.li>
  );
}
