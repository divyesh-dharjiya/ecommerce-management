"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { formatCompact, formatNumber, formatPrice, formatRelativeTime } from "@/lib/format";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { OrderStatusBadge } from "@/features/orders/components/order-status";
import { LiveEventRow } from "@/features/live/components/live-event-row";
import { DataTable, LiveDot, Thumb, type Column } from "@/components/ui";
import { Panel } from "@/features/admin/components/admin-page";
import { LiveBarChart, RevenueAreaChart } from "@/features/admin/components/dashboard/charts";
import type { CategoryShare, SeriesPoint, TopProduct } from "@/features/admin/services/analytics";
import type { LiveEvent, Order, Product } from "@/types";

export function RevenuePanel({ data, total, days }: { data: SeriesPoint[]; total: number; days: number }) {
  return (
    <Panel className="xl:col-span-2" title={`Revenue · last ${days} days`} action={<span className="text-sm font-semibold tabular-nums">{formatPrice(total)}</span>}>
      <RevenueAreaChart data={data} />
    </Panel>
  );
}

export function LiveSalesPanel({ data, events, now }: { data: SeriesPoint[]; events: LiveEvent[]; now: number }) {
  const total = data.reduce((s, p) => s + p.revenue, 0);
  return (
    <Panel
      title={<><LiveDot /> Live sales · last 20 min</>}
      action={<span className="text-sm font-semibold tabular-nums text-success">{formatPrice(total)}</span>}
    >
      <LiveBarChart data={data} />
      <ul className="mt-4 space-y-2" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {events.slice(0, 4).map((e) => (
            <motion.li key={e.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={spring.gentle}>
              <LiveEventRow event={e} now={now} compact />
            </motion.li>
          ))}
        </AnimatePresence>
        {events.length === 0 && <li className="text-sm text-muted-foreground">Waiting for live orders…</li>}
      </ul>
    </Panel>
  );
}

/** Single-hue magnitude bars — one measure across categories, direct-labelled. */
export function CategorySalesPanel({ data }: { data: CategoryShare[] }) {
  const max = Math.max(1, ...data.map((c) => c.revenue));
  return (
    <Panel title="Sales by category">
      <ul className="space-y-3">
        {data.map((c) => (
          <li key={c.category}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="capitalize">{c.category.replace(/-/g, " ")}</span>
              <span className="font-semibold tabular-nums">{formatPrice(c.revenue)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full origin-left animate-grow rounded-full bg-primary transition-[width] duration-700" style={{ width: `${(c.revenue / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function TopProductsPanel({ data }: { data: TopProduct[] }) {
  return (
    <Panel title="Top products" action={<Link href="/admin/products" className="text-xs font-semibold text-primary">Manage</Link>}>
      <ol className="space-y-3">
        {data.map((p, i) => (
          <li key={p.productId} className="flex items-center gap-3">
            <span className="w-4 text-sm font-bold text-muted-foreground">{i + 1}</span>
            <Thumb src={p.thumbnail} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">{formatNumber(p.units)} units</p>
            </div>
            <span className="text-sm font-semibold tabular-nums">${formatCompact(p.revenue)}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function LowStockPanel({ products }: { products: Product[] }) {
  const adjustStock = useCatalogStore((s) => s.adjustStock);
  return (
    <Panel title={<><AlertTriangle className="size-4 text-amber-500" /> Low stock</>}>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">All products are well stocked.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <Thumb src={p.thumbnail} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <p className={cn("text-xs font-semibold", p.stock === 0 ? "text-danger" : "text-amber-600 dark:text-amber-400")}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  adjustStock({ [p.id]: 50 });
                  toast.success(`Restocked ${p.title}`, { description: "+50 units" });
                }}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary"
              >
                <PackagePlus className="size-3.5" /> +50
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function RecentOrdersPanel({ orders, now }: { orders: Order[]; now: number }) {
  const columns: Column<Order>[] = [
    {
      id: "order",
      header: "Order",
      cell: (o) => (
        <span className="font-semibold">
          {o.number}
          {o.source === "live" && <span className="ml-2 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">live</span>}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (o) => (
        <>
          <p className="font-medium">{o.customer.fullName}</p>
          <p className="text-xs text-muted-foreground">{o.customer.city}, {o.customer.country}</p>
        </>
      ),
    },
    { id: "status", header: "Status", cell: (o) => <OrderStatusBadge status={o.status} /> },
    { id: "placed", header: "Placed", cell: (o) => <span className="text-muted-foreground">{formatRelativeTime(o.createdAt, now)}</span> },
    { id: "total", header: "Total", align: "right", cell: (o) => <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span> },
  ];
  return (
    <Panel
      title="Recent orders"
      action={
        <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-primary">
          View all <ArrowRight className="size-3" />
        </Link>
      }
    >
      <div className="-mx-5 sm:-mx-6">
        <DataTable variant="plain" rows={orders.slice(0, 6)} columns={columns} getRowId={(o) => o.id} minWidth={640} />
      </div>
    </Panel>
  );
}
