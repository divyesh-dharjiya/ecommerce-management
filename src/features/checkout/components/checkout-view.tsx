"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "@/hooks";
import { formatPrice } from "@/lib/format";
import { useCartStore, useCartSummary, type CartLine } from "@/features/cart/store/cart-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import { validateCustomer } from "@/features/checkout/services/validation";
import { loadSavedAddress, saveAddress } from "@/features/checkout/services/address-storage";
import { ShippingFields } from "@/features/checkout/components/shipping-fields";
import { PaymentMethodPicker } from "@/features/checkout/components/payment-method-picker";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { ClientGate } from "@/components/providers/client-gate";
import { Button, buttonClasses, Card, Container, EmptyState, Skeleton, Thumb } from "@/components/ui";
import type { CustomerDetails, OrderLine, PaymentMethod } from "@/types";

const toOrderLines = (lines: CartLine[]): OrderLine[] =>
  lines.map(({ item, product }) => ({
    productId: product.id,
    title: product.title,
    thumbnail: product.thumbnail,
    category: product.category,
    unitPrice: product.price,
    quantity: item.quantity,
  }));

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="mb-6 flex items-center gap-3 text-lg font-bold">
        <span className="grid size-7 place-items-center rounded-full bg-primary text-xs text-primary-foreground">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function PlacingOrder() {
  return (
    <Container className="grid min-h-[60vh] place-items-center">
      <div className="flex animate-fade-up flex-col items-center gap-4 text-center" role="status">
        <Loader2 className="size-10 animate-spin text-accent" />
        <p className="text-lg font-semibold">Placing your order…</p>
        <p className="text-sm text-muted-foreground">Authorising payment and reserving stock.</p>
      </div>
    </Container>
  );
}

export function CheckoutView() {
  return (
    <ClientGate
      fallback={
        <Container className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1fr_420px]">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-96" />
        </Container>
      }
    >
      <CheckoutForm />
    </ClientGate>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const { lines, totals, coupon } = useCartSummary();
  const clearCart = useCartStore((s) => s.clear);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const form = useForm<CustomerDetails>(loadSavedAddress, validateCustomer);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);

  if (submitting) return <PlacingOrder />;

  if (lines.length === 0) {
    return (
      <Container>
        <EmptyState
          icon={<ShoppingBag className="size-9" />}
          title="Nothing to check out"
          description="Your bag is empty. Add a few items and come back."
          action={
            <Link href="/products" className={buttonClasses()}>
              Browse products
            </Link>
          }
        />
      </Container>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = form.validate();
    if (invalid) {
      toast.error("Please fix the highlighted fields");
      document.getElementById(String(invalid))?.focus();
      return;
    }
    const outOfStock = lines.find(({ item, product }) => item.quantity > product.stock);
    if (outOfStock) {
      toast.error(`Only ${outOfStock.product.stock} × ${outOfStock.product.title} left in stock`);
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulated payment authorisation
    const customer = { ...form.values, email: form.values.email.trim().toLowerCase() };
    const order = placeOrder({
      lines: toOrderLines(lines),
      customer,
      paymentMethod: payment,
      couponCode: coupon?.code ?? null,
    });
    saveAddress(form.values);
    router.replace(`/orders/${order.id}?placed=1`);
    clearCart();
  };

  return (
    <Container className="py-12">
      <h1 className="animate-fade-up font-display text-4xl tracking-tight">Checkout</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Lock className="size-3.5" /> Secure, encrypted checkout
      </p>

      <form onSubmit={submit} noValidate className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_420px]">
        <div className="animate-fade-up space-y-8 [animation-delay:60ms]">
          <Step n={1} title="Contact & shipping">
            <ShippingFields bind={form.bind} errors={form.errors} />
          </Step>
          <Step n={2} title="Payment">
            <PaymentMethodPicker value={payment} onChange={setPayment} />
            <p className="mt-5 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              This is a demo store — no payment details are collected and no real charge is made.
            </p>
          </Step>
        </div>

        <Card className="sticky top-24 animate-fade-up p-6 [animation-delay:120ms]">
          <h2 className="text-lg font-bold">Order summary</h2>
          <ul className="my-5 max-h-64 space-y-4 overflow-y-auto pr-1">
            {lines.map(({ item, product }) => (
              <li key={product.id} className="flex items-center gap-3">
                <Thumb src={product.thumbnail} size="md" className="overflow-visible">
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {item.quantity}
                  </span>
                </Thumb>
                <p className="line-clamp-2 flex-1 text-sm font-medium">{product.title}</p>
                <p className="text-sm font-semibold">{formatPrice(product.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <OrderSummary totals={totals} coupon={coupon}>
            <Button type="submit" size="lg" className="w-full">
              Place order · {formatPrice(totals.total)}
            </Button>
          </OrderSummary>
        </Card>
      </form>
    </Container>
  );
}
