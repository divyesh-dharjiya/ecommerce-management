import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const META: Record<OrderStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: Clock },
  processing: { label: "Processing", className: "bg-blue-500/15 text-blue-700 dark:text-blue-400", icon: Package },
  shipped: { label: "Shipped", className: "bg-teal-600/15 text-teal-700 dark:text-teal-400", icon: Truck },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  cancelled: { label: "Cancelled", className: "bg-danger/12 text-danger", icon: XCircle },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { label, className: tone, icon: Icon } = META[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tone, className)}
    >
      <Icon className="size-3.5" /> {label}
    </span>
  );
}

const FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

/** Progress through the delivery steps, with the date each step was reached when known. */
export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") return <OrderStatusBadge status="cancelled" />;
  const current = FLOW.indexOf(order.status);
  return (
    <ol className="flex items-center" aria-label="Order progress">
      {FLOW.map((s, i) => {
        const { label, icon: Icon } = META[s];
        const done = i <= current;
        const at = order.history?.find((h) => h.status === s)?.at;
        return (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full border-2 transition",
                  done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
              {at && (
                <time dateTime={at} className="-mt-1.5 text-[11px] text-muted-foreground max-sm:hidden">
                  {formatDate(at, { month: "short", day: "numeric" })}
                </time>
              )}
            </div>
            {i < FLOW.length - 1 && (
              <span className={cn("mx-2 mb-6 h-0.5 flex-1 rounded-full", i < current ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Dated list of the order's status changes (newest first), with any note such as a cancel reason. */
export function StatusHistory({ order, className }: { order: Order; className?: string }) {
  const history = order.history ?? [{ status: order.status, at: order.createdAt }];
  return (
    <ol className={cn("space-y-2 text-sm", className)} aria-label="Status history">
      {[...history].reverse().map((h) => (
        <li key={`${h.status}-${h.at}`} className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium">{META[h.status].label}</span>
          <time dateTime={h.at} className="text-xs text-muted-foreground">
            {formatDate(h.at, { dateStyle: "medium", timeStyle: "short" })}
          </time>
          {h.note && <span className="w-full text-xs text-muted-foreground">“{h.note}”</span>}
        </li>
      ))}
    </ol>
  );
}
