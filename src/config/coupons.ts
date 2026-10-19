import type { Coupon } from "@/types";

export const COUPONS: readonly Coupon[] = [
  { code: "WELCOME10", description: "10% off your order", type: "percent", value: 10, minSubtotal: 0 },
  { code: "LUXE20", description: "20% off orders over $200", type: "percent", value: 20, minSubtotal: 200 },
  { code: "SAVE15", description: "$15 off orders over $75", type: "fixed", value: 15, minSubtotal: 75 },
  { code: "FREESHIP", description: "Free shipping on any order", type: "free-shipping", value: 0, minSubtotal: 0 },
];

export const findCoupon = (code: string): Coupon | undefined =>
  COUPONS.find((c) => c.code === code.trim().toUpperCase());
