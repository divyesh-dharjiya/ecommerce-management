"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useDebounce, useNow } from "@/hooks";
import { downloadFile, toCsv, todayStamp } from "@/lib/download";
import { formatDate, formatPrice, formatRelativeTime } from "@/lib/format";
import { useOrderStore } from "@/features/orders/store/order-store";
import { ORDER_STATUSES } from "@/features/orders/components/order-status";
import { ClientGate } from "@/components/providers/client-gate";
import { Button, DataTable, SearchInput, SegmentedControl, Skeleton, Thumb, type Column } from "@/components/ui";
import { AdminPageHeader } from "@/features/admin/components/admin-page";
import { OrderDetailModal } from "@/features/admin/components/order-detail-modal";
import type { Order, OrderStatus } from "@/types";

const SOURCE_LABEL: Record<Order["source"], string> = { web: "Storefront", live: "Live", seed: "Historical" };
type StatusFilter = OrderStatus | "all";

function exportOrders(orders: Order[]) {
  const csv = toCsv(
    ["Order", "Date", "Customer", "Email", "City", "Country", "Items", "Status", "Payment", "Total"],
    orders.map((o) => [
      o.number,
      o.createdAt,
      o.customer.fullName,
      o.customer.email,
      o.customer.city,
      o.customer.country,
      o.lines.reduce((n, l) => n + l.quantity, 0),
      o.status,
      o.paymentMethod,
      o.total.toFixed(2),
    ]),
  );
  downloadFile(`luxe-orders-${todayStamp()}.csv`, csv, "text/csv;charset=utf-8");
  toast.success(`Exported ${orders.length} orders`);
}

export function OrdersTable() {
  return (
    <ClientGate fallback={<Skeleton className="h-[600px]" />}>
      <OrdersView />
    </ClientGate>
  );
}

function OrdersView() {
  const orders = useOrderStore((s) => s.orders);
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const now = useNow(30_000);
  const [term, setTerm] = useState("");
  const search = useDebounce(term, 200).trim().toLowerCase();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [viewingId, setViewingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: orders.length };
    for (const o of orders) m[o.status] = (m[o.status] ?? 0) + 1;
    return m;
  }, [orders]);

  const rows = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          (!search ||
            o.number.toLowerCase().includes(search) ||
            o.customer.fullName.toLowerCase().includes(search) ||
            o.customer.email.includes(search)),
      ),
    [orders, status, search],
  );

  const statusOptions = (["all", ...ORDER_STATUSES] as const).map((s) => ({
    value: s,
    label: (
      <span className="capitalize">
        {s} <span className="opacity-60">{counts[s] ?? 0}</span>
      </span>
    ),
  }));

  const columns: Column<Order>[] = [
    {
      id: "number",
      header: "Order",
      sortValue: (o) => o.number,
      cell: (o) => (
        <>
          <p className="font-semibold">{o.number}</p>
          <p className="text-xs text-muted-foreground">{SOURCE_LABEL[o.source]}</p>
        </>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      sortValue: (o) => o.customer.fullName,
      cell: (o) => (
        <>
          <p className="font-medium">{o.customer.fullName}</p>
          <p className="text-xs text-muted-foreground">{o.customer.email}</p>
        </>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: (o) => (
        <div className="flex -space-x-2">
          {o.lines.slice(0, 3).map((l) => (
            <Thumb key={l.productId} src={l.thumbnail} size="xs" className="border-2 border-card" />
          ))}
        </div>
      ),
    },
    {
      id: "date",
      header: "Date",
      sortValue: (o) => o.createdAt,
      cell: (o) => (
        <time
          dateTime={o.createdAt}
          title={formatDate(o.createdAt, { dateStyle: "medium", timeStyle: "short" })}
          className="text-muted-foreground"
        >
          {formatRelativeTime(o.createdAt, now)}
        </time>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (o) => (
        <select
          value={o.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            updateStatus(o.id, e.target.value as OrderStatus);
            toast.success(`${o.number} marked ${e.target.value}`);
          }}
          aria-label={`Status for ${o.number}`}
          className="cursor-pointer rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold capitalize outline-none focus:border-primary"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      id: "total",
      header: "Total",
      align: "right",
      sortValue: (o) => o.total,
      cell: (o) => <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Orders"
        description={`${orders.length} orders · updates live`}
        actions={
          <Button variant="outline" onClick={() => exportOrders(rows)}>
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="relative overflow-x-auto pb-1 scrollbar-none">
        <SegmentedControl
          label="Filter by status"
          variant="solid"
          value={status}
          onChange={setStatus}
          options={statusOptions}
        />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(o) => o.id}
        initialSort={{ id: "date", dir: -1 }}
        pageSize={12}
        resetKey={`${status}|${search}`}
        onRowClick={(o) => setViewingId(o.id)}
        emptyMessage="No orders found."
        minWidth={820}
        toolbar={
          <SearchInput
            value={term}
            onValueChange={setTerm}
            placeholder="Search order #, customer, email…"
            className="w-full max-w-sm"
          />
        }
      />

      <OrderDetailModal orderId={viewingId} onClose={() => setViewingId(null)} />
    </div>
  );
}
