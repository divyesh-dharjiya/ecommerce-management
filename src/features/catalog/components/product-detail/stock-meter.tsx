import { Check, Zap } from "lucide-react";
import { commerceConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Stock availability message + bar. Width animates via CSS when stock changes live. */
export function StockMeter({ stock, capacity = 100 }: { stock: number; capacity?: number }) {
  if (stock <= 0) return <p className="font-semibold text-danger">Currently sold out — restocking soon</p>;
  const low = stock <= commerceConfig.lowStockThreshold;
  const pct = Math.max(4, Math.min(100, (stock / capacity) * 100));
  return (
    <div>
      <p className="text-sm">
        {low ? (
          <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
            <Zap className="size-4 fill-current" /> Hurry! Only {stock} left in stock
          </span>
        ) : (
          <span className="flex items-center gap-1 font-medium text-success">
            <Check className="size-4" /> In stock · {stock} available
          </span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
        <div
          className={cn("h-full origin-left animate-grow rounded-full transition-[width] duration-700", low ? "bg-amber-500" : "bg-success")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
