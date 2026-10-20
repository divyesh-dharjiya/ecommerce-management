"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, ShoppingBag } from "lucide-react";
import { useCartStore, useCartSummary } from "@/features/cart/store/cart-store";
import { useHydrated } from "@/store/ui-store";
import { buttonClasses, Card, Container, EmptyState, Skeleton } from "@/components/ui";
import { CartLine } from "@/features/cart/components/cart-line";
import { FreeShippingMeter } from "@/features/cart/components/free-shipping-meter";
import { OrderSummary } from "@/features/cart/components/order-summary";

export function CartView() {
  const hydrated = useHydrated();
  const { lines, totals, coupon, couponIssue } = useCartSummary();
  const clear = useCartStore((s) => s.clear);
  const hasStockIssue = lines.some(({ item, product }) => item.quantity > product.stock);

  if (!hydrated) {
    return (
      <Container className="py-12">
        <Skeleton className="mb-8 h-10 w-56" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-80" />
        </div>
      </Container>
    );
  }

  if (lines.length === 0) {
    return (
      <Container>
        <EmptyState
          icon={<ShoppingBag className="size-9" />}
          title="Your bag is empty"
          description="Once you add something to your bag, it will appear here. Ready to get started?"
          action={
            <Link href="/products" className={buttonClasses("primary", "lg")}>
              Start shopping <ArrowRight className="size-5" />
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Shopping bag</h1>
          <p className="mt-1 text-muted-foreground">{totals.itemCount} items</p>
        </div>
        <button type="button" onClick={clear} className="text-sm font-medium text-muted-foreground hover:text-danger">
          Clear bag
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <FreeShippingMeter subtotal={totals.subtotal} remaining={totals.freeShippingRemaining} />
          <ul className="mt-2 divide-y divide-border">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <CartLine key={line.product.id} line={line} />
              ))}
            </AnimatePresence>
          </ul>
          <Link href="/products" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">
            <ArrowLeft className="size-4" /> Continue shopping
          </Link>
        </div>

        <Card className="sticky top-24 p-6">
          <h2 className="mb-5 text-lg font-bold">Order summary</h2>
          <OrderSummary totals={totals} coupon={coupon} couponIssue={couponIssue}>
            {hasStockIssue && (
              <p className="rounded-md bg-danger/10 p-3 text-sm font-medium text-danger">
                Some items exceed available stock. Please update quantities to continue.
              </p>
            )}
            <Link
              href="/checkout"
              aria-disabled={hasStockIssue}
              className={buttonClasses(
                "primary",
                "lg",
                `w-full ${hasStockIssue ? "pointer-events-none opacity-50" : ""}`,
              )}
            >
              <Lock className="size-4" /> Secure checkout
            </Link>
          </OrderSummary>
        </Card>
      </div>
    </Container>
  );
}
