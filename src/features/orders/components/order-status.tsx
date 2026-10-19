import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

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

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return <OrderStatusBadge status="cancelled" />;
  const current = FLOW.indexOf(status);
  return (
    <ol className="flex items-center" aria-label="Order progress">
      {FLOW.map((s, i) => {
        const { label, icon: Icon } = META[s];
        const done = i <= current;
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
