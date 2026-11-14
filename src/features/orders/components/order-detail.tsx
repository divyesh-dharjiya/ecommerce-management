"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { Check, PackageX } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import { useOrderStore } from "@/features/orders/store/order-store";
import { useHydrated } from "@/store/ui-store";
import { buttonClasses, Card, Container, EmptyState, Skeleton, Thumb } from "@/components/ui";
import { OrderTimeline, StatusHistory } from "@/features/orders/components/order-status";
import { OrderActions } from "@/features/orders/components/order-actions";
import { OrderTotals } from "@/features/orders/components/order-totals";
import { Confetti } from "@/features/orders/components/confetti";
import { PAYMENT_LABEL } from "@/features/checkout/config";

/**
 * `?placed=1` marks the redirect from checkout. It is read once and then
 * removed from the URL, so refreshing or sharing the page doesn't replay the
 * celebration.
 */
function useJustPlaced() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [justPlaced] = useState(() => params.get("placed") === "1");
  useEffect(() => {
    if (!justPlaced) return;
    window.scrollTo({ top: 0 });
    window.history.replaceState(window.history.state, "", pathname);
  }, [justPlaced, pathname]);
  return justPlaced;
}

export function OrderDetail({ id }: { id: string }) {
  const hydrated = useHydrated();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const justPlaced = useJustPlaced();

  if (!hydrated) {
    return (
      <Container className="py-12">
        <Skeleton className="mx-auto h-[500px] max-w-3xl" />
      </Container>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={<PackageX className="size-9" />}
        headingLevel="h1"
        title="Order not found"
        description="We couldn't find this order on this device."
        action={
          <Link href="/orders" className={buttonClasses()}>
            View all orders
          </Link>
        }
      />
    );
  }

  return (
    <Container className="max-w-3xl py-12">
      {justPlaced && <Confetti />}
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        {justPlaced && (
          <m.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-success text-white shadow-lg shadow-success/30"
          >
            <Check className="size-10" strokeWidth={3} />
          </m.span>
        )}
        <h1 className="font-display text-2xl sm:text-3xl">
          {justPlaced ? "Thank you for your order!" : `Order ${order.number}`}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {justPlaced
            ? `Order #${order.number} is confirmed. Updates will go to ${order.customer.email}.`
            : `Placed on ${formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}`}
        </p>
      </m.div>

      <Card className="mt-10 p-6 sm:p-8">
        <OrderTimeline order={order} />
        {order.status === "cancelled" && <StatusHistory order={order} className="mt-4" />}
      </Card>

      <Card className="mt-6 divide-y divide-border">
        <ul className="divide-y divide-border">
          {order.lines.map((l) => (
            <li key={l.productId} className="flex items-center gap-4 p-5">
              <Thumb src={l.thumbnail} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{l.title}</p>
                <p className="text-sm text-muted-foreground">
                  Qty {l.quantity} × {formatPrice(l.unitPrice)}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(l.unitPrice * l.quantity)}</p>
            </li>
          ))}
        </ul>
        <OrderTotals order={order} className="p-5" />
        <div className="grid grid-cols-1 gap-6 p-5 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold">Shipping to</p>
            <p className="mt-1 text-muted-foreground">
              {order.customer.fullName}
              <br />
              {order.customer.address}
              <br />
              {order.customer.city}, {order.customer.postalCode}
              <br />
              {order.customer.country}
            </p>
          </div>
          <div>
            <p className="font-semibold">Payment</p>
            <p className="mt-1 text-muted-foreground">{PAYMENT_LABEL[order.paymentMethod]}</p>
          </div>
        </div>
      </Card>

      <div className="mt-8 space-y-3">
        <OrderActions order={order} />
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/products" className={buttonClasses("primary")}>
            Continue shopping
          </Link>
          <Link href="/orders" className={buttonClasses("ghost")}>
            View all orders
          </Link>
        </div>
      </div>
    </Container>
  );
}
