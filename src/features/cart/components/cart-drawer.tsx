"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useCartSummary } from "@/features/cart/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { buttonClasses, Drawer, EmptyState } from "@/components/ui";
import { CartLine } from "@/features/cart/components/cart-line";
import { FreeShippingMeter } from "@/features/cart/components/free-shipping-meter";

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const setOpen = useUiStore((s) => s.setCartOpen);
  const { lines, totals } = useCartSummary();
  const close = () => setOpen(false);

  return (
    <Drawer open={open} onClose={close} title={`Your bag (${totals.itemCount})`}>
      {lines.length === 0 ? (
        <EmptyState
          className="flex-1"
          icon={<ShoppingBag className="size-9" />}
          title="Your bag is empty"
          description="Looks like you haven't added anything yet. Explore our latest arrivals."
          action={
            <Link href="/products" onClick={close} className={buttonClasses("primary")}>
              Start shopping <ArrowRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <>
          <div className="px-6 pt-4">
            <FreeShippingMeter subtotal={totals.subtotal} remaining={totals.freeShippingRemaining} />
          </div>
          <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <CartLine key={line.product.id} line={line} compact />
              ))}
            </AnimatePresence>
          </ul>
          <div className="space-y-3 border-t border-border bg-muted/30 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold">{formatPrice(totals.subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping, taxes and discounts calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/cart" onClick={close} className={buttonClasses("outline")}>
                View bag
              </Link>
              <Link href="/checkout" onClick={close} className={buttonClasses("primary")}>
                Checkout <ArrowRight className="size-4" />
              </Link>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Secure checkout · 30-day returns
            </p>
          </div>
        </>
      )}
    </Drawer>
  );
}
