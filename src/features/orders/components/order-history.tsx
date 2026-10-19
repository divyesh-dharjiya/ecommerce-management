"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Receipt } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";
import { useOrderStore } from "@/features/orders/store/order-store";
import { useHydrated } from "@/store/ui-store";
import { buttonClasses, Container, EmptyState, PageHeader, Thumb, Skeleton } from "@/components/ui";
import { OrderStatusBadge } from "@/features/orders/components/order-status";

export function OrderHistory() {
  const hydrated = useHydrated();
  const allOrders = useOrderStore((s) => s.orders);
  // Only orders placed by this shopper; seeded/simulated orders are store-wide data.
  const orders = useMemo(() => allOrders.filter((o) => o.source === "web"), [allOrders]);

  return (
    <>
      <PageHeader title="Your orders" description="Track, review and reorder your purchases." breadcrumbs={[{ href: "/", label: "Home" }, { label: "Orders" }]} />
      <Container className="py-10">
        {!hydrated ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-9" />}
            title="No orders yet"
            description="When you place an order, it will show up here so you can track it."
            action={<Link href="/products" className={buttonClasses()}>Start shopping</Link>}
          />
        ) : (
          <ul className="space-y-4">
            {orders.map((o, i) => (
              <motion.li key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/orders/${o.id}`} className="group flex flex-wrap items-center gap-6 rounded-3xl border border-border bg-card p-5 transition hover:shadow-lift">
                  <div className="flex -space-x-4">
                    {o.lines.slice(0, 3).map((l) => (
                      <Thumb key={l.productId} src={l.thumbnail} size="lg" className="border-4 border-card" />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Order {o.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(o.createdAt, { dateStyle: "medium", timeStyle: "short" })} · {o.lines.reduce((n, l) => n + l.quantity, 0)} items
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                  <p className="text-lg font-bold">{formatPrice(o.total)}</p>
                  <ArrowRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
