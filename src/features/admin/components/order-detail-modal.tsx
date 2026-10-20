"use client";

import { toast } from "sonner";
import { useRetained } from "@/hooks";
import { formatDate, formatPrice } from "@/lib/format";
import { useOrderStore } from "@/features/orders/store/order-store";
import { OrderStatusBadge, StatusHistory } from "@/features/orders/components/order-status";
import { NEXT_STATUSES } from "@/features/orders/services/workflow";
import { PAYMENT_LABEL } from "@/features/checkout/config";
import { Button, Modal, Thumb } from "@/components/ui";

/** Admin order inspector with status workflow. Reads live data by id. */
export function OrderDetailModal({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const current = useOrderStore((s) => (orderId ? s.orders.find((o) => o.id === orderId) : undefined));
  const order = useRetained(current);
  const updateStatus = useOrderStore((s) => s.updateStatus);

  return (
    <Modal open={!!current} onClose={onClose} title={order ? `Order ${order.number}` : ""} className="max-w-xl">
      {order && (
        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm text-muted-foreground">
              {formatDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {order.lines.map((l) => (
              <li key={l.productId} className="flex items-center gap-3 p-3">
                <Thumb src={l.thumbnail} size="md" />
                <p className="min-w-0 flex-1 truncate text-sm">{l.title}</p>
                <p className="text-sm text-muted-foreground">×{l.quantity}</p>
                <p className="text-sm font-semibold">{formatPrice(l.unitPrice * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="font-medium">{order.customer.fullName}</dd>
              <dd className="text-muted-foreground">{order.customer.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ship to</dt>
              <dd>
                {order.customer.address}, {order.customer.city}, {order.customer.country}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payment</dt>
              <dd>{PAYMENT_LABEL[order.paymentMethod]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="text-lg font-bold">{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <StatusHistory order={order} />
          <div className="border-t border-border pt-5">
            {NEXT_STATUSES[order.status].length === 0 ? (
              <p className="text-sm text-muted-foreground">This order is {order.status}. No further steps.</p>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Move order to">
                {NEXT_STATUSES[order.status].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === "cancelled" ? "outline" : "dark"}
                    className={s === "cancelled" ? "text-danger" : undefined}
                    onClick={() => {
                      if (updateStatus(order.id, s)) toast.success(`${order.number} marked ${s}`);
                    }}
                  >
                    {s === "cancelled" ? "Cancel order" : `Mark as ${s}`}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
