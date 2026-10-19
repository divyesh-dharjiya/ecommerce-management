"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, PackageX } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import { useOrderStore } from "@/features/orders/store/order-store";
import { useHydrated } from "@/store/ui-store";
import { buttonClasses, Card, Container, EmptyState, Skeleton, Thumb } from "@/components/ui";
import { OrderTimeline } from "@/features/orders/components/order-status";
import { PAYMENT_LABEL } from "@/features/checkout/config";


function Confetti() {
  const colors = ["#8b5cf6", "#ec4899", "#f97316", "#22c55e", "#3b82f6", "#eab308"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {Array.from({ length: 60 }, (_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 10) * 0.05;
        const rotate = (i * 47) % 360;
        return (
          <motion.span
            key={i}
            className="absolute top-0 block h-3 w-1.5 rounded-sm"
            style={{ left: `${left}%`, backgroundColor: colors[i % colors.length] }}
            initial={{ y: -20, opacity: 1, rotate }}
            animate={{ y: "105vh", opacity: [1, 1, 0], rotate: rotate + 540, x: ((i % 7) - 3) * 30 }}
            transition={{ duration: 2.4 + (i % 5) * 0.3, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const hydrated = useHydrated();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const justPlaced = useSearchParams().get("placed") === "1";

  useEffect(() => {
    if (justPlaced) window.scrollTo({ top: 0 });
  }, [justPlaced]);

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
        title="Order not found"
        description="We couldn't find this order on this device."
        action={<Link href="/orders" className={buttonClasses()}>View all orders</Link>}
      />
    );
  }

  return (
    <Container className="max-w-3xl py-12">
      {justPlaced && <Confetti />}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        {justPlaced && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-success text-white shadow-lg shadow-success/30"
          >
            <Check className="size-10" strokeWidth={3} />
          </motion.span>
        )}
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {justPlaced ? "Thank you for your order!" : `Order ${order.number}`}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {justPlaced
            ? `Confirmation #${order.number} has been sent to ${order.customer.email}.`
            : `Placed on ${formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}`}
        </p>
      </motion.div>

      <Card className="mt-10 p-6 sm:p-8">
        <OrderTimeline status={order.status} />
      </Card>

      <Card className="mt-6 divide-y divide-border">
        <ul className="divide-y divide-border">
          {order.lines.map((l) => (
            <li key={l.productId} className="flex items-center gap-4 p-5">
              <Thumb src={l.thumbnail} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{l.title}</p>
                <p className="text-sm text-muted-foreground">Qty {l.quantity} × {formatPrice(l.unitPrice)}</p>
              </div>
              <p className="font-semibold">{formatPrice(l.unitPrice * l.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 p-5 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><dt className="text-muted-foreground">Discount ({order.couponCode})</dt><dd className="text-success">−{formatPrice(order.discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatPrice(order.tax)}</dd></div>
          <div className="flex justify-between pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>
        <div className="grid grid-cols-1 gap-6 p-5 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold">Shipping to</p>
            <p className="mt-1 text-muted-foreground">
              {order.customer.fullName}<br />
              {order.customer.address}<br />
              {order.customer.city}, {order.customer.postalCode}<br />
              {order.customer.country}
            </p>
          </div>
          <div>
            <p className="font-semibold">Payment</p>
            <p className="mt-1 text-muted-foreground">{PAYMENT_LABEL[order.paymentMethod]}</p>
          </div>
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/products" className={buttonClasses("primary")}>Continue shopping</Link>
        <Link href="/orders" className={buttonClasses("outline")}>View all orders</Link>
      </div>
    </Container>
  );
}
