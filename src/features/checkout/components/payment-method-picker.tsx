"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { PAYMENT_OPTIONS } from "@/features/checkout/config";
import type { PaymentMethod } from "@/types";

export function PaymentMethodPicker({ value, onChange }: { value: PaymentMethod; onChange: (v: PaymentMethod) => void }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PAYMENT_OPTIONS.map(({ id, label, description, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={cn(
              "relative rounded-2xl border-2 p-4 text-left transition-colors duration-300",
              active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
            )}
          >
            <Icon className={cn("size-5 transition-colors", active ? "text-primary" : "text-muted-foreground")} />
            <p className="mt-3 font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {active && (
              <motion.span layoutId="payment-dot" transition={spring.snappy} className="absolute right-4 top-4 size-3 rounded-full bg-primary ring-4 ring-primary/20" />
            )}
          </button>
        );
      })}
    </div>
  );
}
