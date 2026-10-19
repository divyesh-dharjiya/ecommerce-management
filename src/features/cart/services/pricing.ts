import { commerceConfig } from "@/config/site";
import { round2 } from "@/lib/utils";
import type { CartTotals, Coupon } from "@/types";

export interface PricedLine {
  unitPrice: number;
  quantity: number;
}

export type CouponValidation =
  | { ok: true; coupon: Coupon }
  | { ok: false; reason: string };

export function validateCoupon(coupon: Coupon | undefined, subtotal: number): CouponValidation {
  if (!coupon) return { ok: false, reason: "This code isn't valid." };
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      reason: `Add $${round2(coupon.minSubtotal - subtotal).toFixed(2)} more to use ${coupon.code}.`,
    };
  }
  return { ok: true, coupon };
}

/**
 * Single source of truth for money maths — used by the cart, checkout and
 * order creation so the customer always sees exactly what they are charged.
 * Tax is applied after discounts, shipping is not taxed.
 */
export function calculateTotals(lines: PricedLine[], coupon?: Coupon | null): CartTotals {
  const { freeShippingThreshold, flatShippingRate, taxRate } = commerceConfig;

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = round2(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));

  const applicable = coupon && subtotal >= coupon.minSubtotal ? coupon : null;

  let discount = 0;
  if (applicable?.type === "percent") discount = round2((subtotal * applicable.value) / 100);
  if (applicable?.type === "fixed") discount = Math.min(applicable.value, subtotal);

  const discounted = round2(subtotal - discount);
  const qualifiesForFreeShipping =
    subtotal >= freeShippingThreshold || applicable?.type === "free-shipping";
  const shipping = itemCount === 0 || qualifiesForFreeShipping ? 0 : flatShippingRate;
  const tax = round2(discounted * taxRate);

  return {
    itemCount,
    subtotal,
    discount,
    shipping,
    tax,
    total: round2(discounted + shipping + tax),
    freeShippingRemaining: qualifiesForFreeShipping
      ? 0
      : round2(Math.max(0, freeShippingThreshold - subtotal)),
  };
}
