"use client";

import Link from "next/link";
import { ArrowLeft, PackageX, Printer } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatDate, formatPrice } from "@/lib/format";
import { useHydrated } from "@/store/ui-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import { OrderTotals } from "@/features/orders/components/order-totals";
import { OrderStatusBadge } from "@/features/orders/components/order-status";
import { PAYMENT_LABEL } from "@/features/checkout/config";
import { Button, buttonClasses, Container, EmptyState, Skeleton } from "@/components/ui";
import { Logo } from "@/components/layout/logo";

/** Printable invoice. "Print" uses the browser dialog, which also offers Save as PDF. */
export function Invoice({ id }: { id: string }) {
  const hydrated = useHydrated();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));

  if (!hydrated) {
    return (
      <Container className="py-12">
        <Skeleton className="mx-auto h-[700px] max-w-3xl" />
      </Container>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={<PackageX className="size-9" />}
        headingLevel="h1"
        title="Invoice not found"
        description="We couldn't find this order on this device."
        action={
          <Link href="/orders" className={buttonClasses()}>
            View all orders
          </Link>
        }
      />
    );
  }

  const { customer } = order;
  return (
    <Container className="max-w-3xl py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/orders/${order.id}`} className={buttonClasses("ghost", "sm")}>
          <ArrowLeft className="size-4" /> Back to order
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" /> Print or save PDF
        </Button>
      </div>

      <article className="rounded-xl border border-border bg-card p-8 sm:p-10 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              {siteConfig.fullName}
              <br />
              {siteConfig.supportEmail}
            </p>
          </div>
          <div className="text-right">
            <h1 className="font-display text-4xl">Invoice</h1>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">No.</span> {order.number}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Date</span> {formatDate(order.createdAt, { dateStyle: "long" })}
            </p>
            <OrderStatusBadge status={order.status} className="mt-2" />
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-8 text-sm">
          <div>
            <h2 className="font-semibold">Billed to</h2>
            <p className="mt-1 text-muted-foreground">
              {customer.fullName}
              <br />
              {customer.address}
              <br />
              {customer.city}, {customer.postalCode}
              <br />
              {customer.country}
              <br />
              {customer.email}
            </p>
          </div>
          <div>
            <h2 className="font-semibold">Payment</h2>
            <p className="mt-1 text-muted-foreground">{PAYMENT_LABEL[order.paymentMethod]}</p>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="py-3 font-semibold">
                Item
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                Qty
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                Unit price
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order.lines.map((l) => (
              <tr key={l.productId}>
                <td className="py-3 pr-4">{l.title}</td>
                <td className="py-3 text-right tabular-nums">{l.quantity}</td>
                <td className="py-3 text-right tabular-nums">{formatPrice(l.unitPrice)}</td>
                <td className="py-3 text-right tabular-nums">{formatPrice(l.unitPrice * l.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <OrderTotals order={order} className="ml-auto mt-6 max-w-xs border-t border-border pt-4" />

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Demo store — this invoice is for illustration only and no payment was taken.
        </p>
      </article>
    </Container>
  );
}
