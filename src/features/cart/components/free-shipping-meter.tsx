"use client";

import { m } from "framer-motion";
import { Truck } from "lucide-react";
import { commerceConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";

export function FreeShippingMeter({ subtotal, remaining }: { subtotal: number; remaining: number }) {
  const progress = remaining === 0 ? 100 : Math.min(100, (subtotal / commerceConfig.freeShippingThreshold) * 100);
  return (
    <div className="rounded-xl bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 text-primary" />
        {remaining > 0 ? (
          <span>
            You&apos;re <strong>{formatPrice(remaining)}</strong> away from free delivery
          </span>
        ) : (
          <span className="font-semibold text-success">You&apos;ve unlocked free delivery!</span>
        )}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
        <m.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
        />
      </div>
    </div>
  );
}
