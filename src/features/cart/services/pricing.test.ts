import { describe, expect, it } from "vitest";
import { findCoupon } from "@/config/coupons";
import { calculateTotals, validateCoupon } from "@/features/cart/services/pricing";

describe("calculateTotals", () => {
  it("returns zeros for an empty cart (no phantom shipping)", () => {
    const t = calculateTotals([]);
    expect(t).toMatchObject({ itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 });
  });

  it("charges flat shipping below the free-shipping threshold", () => {
    const t = calculateTotals([{ unitPrice: 20, quantity: 2 }]);
    expect(t.subtotal).toBe(40);
    expect(t.shipping).toBe(9.99);
    expect(t.tax).toBe(3.2);
    expect(t.total).toBe(53.19);
    expect(t.freeShippingRemaining).toBe(60);
  });

  it("ships free at or above the threshold", () => {
    const t = calculateTotals([{ unitPrice: 100, quantity: 1 }]);
    expect(t.shipping).toBe(0);
    expect(t.freeShippingRemaining).toBe(0);
  });

  it("avoids floating point drift", () => {
    const t = calculateTotals([{ unitPrice: 0.1, quantity: 3 }]);
    expect(t.subtotal).toBe(0.3);
  });

  it("applies percent coupons before tax", () => {
    const t = calculateTotals([{ unitPrice: 50, quantity: 2 }], findCoupon("welcome10"));
    expect(t.discount).toBe(10);
    expect(t.tax).toBe(7.2); // 8% of 90
    expect(t.total).toBe(97.2);
  });

  it("ignores coupons whose minimum isn't met", () => {
    const t = calculateTotals([{ unitPrice: 50, quantity: 1 }], findCoupon("LUXE20"));
    expect(t.discount).toBe(0);
  });

  it("never discounts below zero with fixed coupons", () => {
    const coupon = { code: "X", description: "", type: "fixed" as const, value: 500, minSubtotal: 0 };
    const t = calculateTotals([{ unitPrice: 20, quantity: 1 }], coupon);
    expect(t.discount).toBe(20);
    expect(t.total).toBeGreaterThanOrEqual(0);
  });

  it("FREESHIP removes shipping regardless of subtotal", () => {
    const t = calculateTotals([{ unitPrice: 5, quantity: 1 }], findCoupon("FREESHIP"));
    expect(t.shipping).toBe(0);
  });
});

describe("validateCoupon", () => {
  it("rejects unknown codes", () => {
    expect(validateCoupon(findCoupon("NOPE"), 100).ok).toBe(false);
  });

  it("explains how much more to spend", () => {
    const r = validateCoupon(findCoupon("LUXE20"), 150);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("$50.00");
  });

  it("accepts eligible codes case-insensitively", () => {
    expect(validateCoupon(findCoupon(" save15 "), 80).ok).toBe(true);
  });
});
