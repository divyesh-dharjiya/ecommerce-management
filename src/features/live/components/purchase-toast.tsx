import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Thumb } from "@/components/ui";
import type { LiveEvent } from "@/types";

/** Social-proof toast: "Priya from Mumbai purchased …". */
export function PurchaseToast({ event }: { event: LiveEvent }) {
  return (
    <div className="border border-border bg-card/95 backdrop-blur-xl backdrop-saturate-150 flex w-[min(340px,calc(100vw-32px))] items-center gap-3 rounded-lg p-3 shadow-lift">
      <Thumb src={event.thumbnail} size="md" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold">
          {event.customerName} from {event.city}
        </p>
        <p className="truncate text-muted-foreground">purchased {event.productTitle}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-success">
          <ShoppingBag className="size-3" /> just now · {formatPrice(event.amount ?? 0)}
        </p>
      </div>
    </div>
  );
}
