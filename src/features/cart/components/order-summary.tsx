"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Tag, X } from "lucide-react";
import { toast } from "sonner";
import { COUPONS, findCoupon } from "@/config/coupons";
import { formatPrice } from "@/lib/format";
import { validateCoupon } from "@/features/cart/services/pricing";
import { useCartStore } from "@/features/cart/store/cart-store";
import { cn } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import type { CartTotals, Coupon } from "@/types";

function Row({
  label,
  value,
  muted,
  children,
}: {
  label: ReactNode;
  value: ReactNode;
  muted?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-muted-foreground" : undefined}>{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
      {children}
    </div>
  );
}

export function CouponForm({
  subtotal,
  coupon,
  issue,
}: {
  subtotal: number;
  coupon: Coupon | null;
  /** Set when the entered coupon no longer applies (e.g. the bag dropped below its minimum). */
  issue?: string | null;
}) {
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  // A "spend $X more" message goes stale as soon as the bag changes.
  const [errorSubtotal, setErrorSubtotal] = useState(subtotal);
  if (errorSubtotal !== subtotal) {
    setErrorSubtotal(subtotal);
    if (error) setError(null);
  }

  // Not a <form>: this block is rendered inside the checkout form, and forms cannot nest.
  const submit = () => {
    const result = validateCoupon(findCoupon(code), subtotal);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    applyCoupon(result.coupon.code);
    setCode("");
    setError(null);
    toast.success(`Code ${result.coupon.code} applied`, { description: result.coupon.description });
  };

  if (coupon) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-md border border-dashed px-3 py-2.5 text-sm",
          issue ? "border-warning/60 bg-warning/10" : "border-success/50 bg-success/10",
        )}
      >
        <span
          className={cn("flex flex-wrap items-center gap-x-2 font-semibold", issue ? "text-warning" : "text-success")}
        >
          <Tag className="size-4" /> {coupon.code}
          <span className="font-normal text-foreground/70">· {issue ?? coupon.description}</span>
        </span>
        <button
          type="button"
          onClick={() => applyCoupon(null)}
          aria-label="Remove coupon"
          className="rounded-full p-1 hover:bg-success/20"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div role="group" aria-label="Promo code" className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (code.trim()) submit();
            }
          }}
          placeholder="Promo code"
          aria-label="Promo code"
          aria-invalid={!!error}
          className="uppercase placeholder:normal-case"
        />
        <Button variant="dark" disabled={!code.trim()} onClick={submit}>
          Apply
        </Button>
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      <p className="text-xs text-muted-foreground">Try: {COUPONS.map((c) => c.code).join(", ")}</p>
    </div>
  );
}

export function OrderSummary({
  totals,
  coupon,
  couponIssue,
  showCoupon = true,
  children,
}: {
  totals: CartTotals;
  coupon: Coupon | null;
  couponIssue?: string | null;
  showCoupon?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {showCoupon && <CouponForm subtotal={totals.subtotal} coupon={coupon} issue={couponIssue} />}
      <div className="space-y-2.5">
        <Row
          label={`Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"})`}
          value={formatPrice(totals.subtotal)}
          muted
        />
        <AnimatePresence>
          {totals.discount > 0 && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Row
                label="Discount"
                value={<span className="text-success">−{formatPrice(totals.discount)}</span>}
                muted
              />
            </m.div>
          )}
        </AnimatePresence>
        <Row
          label="Shipping"
          value={totals.shipping === 0 ? <span className="text-success">Free</span> : formatPrice(totals.shipping)}
          muted
        />
        <Row label="Estimated tax" value={formatPrice(totals.tax)} muted />
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="font-semibold">Total</span>
        <m.span
          key={totals.total}
          initial={{ scale: 1.08, color: "var(--primary)" }}
          animate={{ scale: 1, color: "var(--foreground)" }}
          className="text-2xl font-extrabold tabular-nums tracking-tight"
        >
          {formatPrice(totals.total)}
        </m.span>
      </div>
      {children}
    </div>
  );
}
