"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/features/cart/store/cart-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useOrderStore } from "@/features/orders/store/order-store";
import { isCancellable } from "@/features/orders/services/workflow";
import { useUiStore } from "@/store/ui-store";
import { Button, buttonClasses, ConfirmDialog, Select } from "@/components/ui";
import type { Order } from "@/types";

export const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price",
  "Delivery takes too long",
  "Changed my mind",
] as const;

/** Adds every still-available line of a past order back to the cart. */
function useBuyAgain() {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  return (order: Order) => {
    const byId = new Map(useCatalogStore.getState().products.map((p) => [p.id, p]));
    let added = 0;
    for (const line of order.lines) {
      const product = byId.get(line.productId);
      if (product?.status === "active" && product.stock > 0) added += addItem(product, line.quantity) > 0 ? 1 : 0;
    }
    const missing = order.lines.length - added;
    if (added === 0) {
      toast.error("These items are no longer available");
      return;
    }
    toast.success(`Added ${added} item${added === 1 ? "" : "s"} to your cart`, {
      description:
        missing > 0 ? `${missing} item${missing === 1 ? " is" : "s are"} unavailable or already maxed out.` : undefined,
    });
    setCartOpen(true);
  };
}

/** Shopper actions on their own order: buy again, invoice, and cancel before it ships. */
export function OrderActions({ order }: { order: Order }) {
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const buyAgain = useBuyAgain();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState<string>(CANCEL_REASONS[0]);

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="outline" onClick={() => buyAgain(order)}>
        <RotateCcw className="size-4" /> Buy again
      </Button>
      <Link href={`/orders/${order.id}/invoice`} className={buttonClasses("outline")}>
        <FileText className="size-4" /> Invoice
      </Link>
      {isCancellable(order) && (
        <Button variant="outline" className="text-danger" onClick={() => setConfirming(true)}>
          <XCircle className="size-4" /> Cancel order
        </Button>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Cancel order ${order.number}?`}
        description={
          order.paymentMethod === "cod"
            ? "Nothing has been charged, so there is nothing to refund."
            : `Your ${formatPrice(order.total)} payment will be refunded to the original payment method.`
        }
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        onConfirm={() => {
          if (updateStatus(order.id, "cancelled", reason)) toast.success(`Order ${order.number} cancelled`);
          else toast.error("This order can no longer be cancelled");
        }}
      >
        <div className="mt-4">
          <Select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason for cancelling">
            {CANCEL_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </div>
      </ConfirmDialog>
    </div>
  );
}
