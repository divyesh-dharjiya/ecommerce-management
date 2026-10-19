"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { commerceConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";

export function FreeShippingMeter({ subtotal, remaining }: { subtotal: number; remaining: number }) {
  const progress = remaining === 0 ? 100 : Math.min(100, (subtotal / commerceConfig.freeShippingThreshold) * 100);
  return (
    <div className="rounded-2xl bg-muted/60 p-4">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 text-primary" />
        {remaining > 0 ? (
          <span>
            You&apos;re <strong>{formatPrice(remaining)}</strong> away from free shipping
          </span>
        ) : (
          <span className="font-semibold text-success">You&apos;ve unlocked free express shipping!</span>
        )}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
        />
      </div>
    </div>
  );
}
