import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

/** Subtotal → total breakdown of a placed order. Shared by the order page and the invoice. */
export function OrderTotals({ order, className }: { order: Order; className?: string }) {
  const rows: [string, string, string?][] = [
    ["Subtotal", formatPrice(order.subtotal)],
    ...(order.discount > 0
      ? [
          [
            `Discount${order.couponCode ? ` (${order.couponCode})` : ""}`,
            `−${formatPrice(order.discount)}`,
            "text-success",
          ] as [string, string, string],
        ]
      : []),
    ["Shipping", order.shipping === 0 ? "Free" : formatPrice(order.shipping)],
    ["Tax", formatPrice(order.tax)],
  ];
  return (
    <dl className={cn("space-y-2 text-sm", className)}>
      {rows.map(([label, value, tone]) => (
        <div key={label} className="flex justify-between">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={cn("tabular-nums", tone)}>{value}</dd>
        </div>
      ))}
      <div className="flex justify-between pt-2 text-base font-bold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatPrice(order.total)}</dd>
      </div>
    </dl>
  );
}
