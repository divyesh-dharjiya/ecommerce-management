import Link from "next/link";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Thumb } from "@/components/ui";
import type { LiveEvent } from "@/types";

/** One realtime event (purchase / restock). Shared by the storefront feed and the admin dashboard. */
export function LiveEventRow({
  event,
  now,
  href,
  compact,
}: {
  event: LiveEvent;
  now: number;
  href?: string;
  compact?: boolean;
}) {
  const body = (
    <>
      <Thumb src={event.thumbnail} size={compact ? "xs" : "md"} />
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate">
          {event.kind === "purchase" ? (
            <>
              <span className="font-semibold">{event.customerName}</span>
              <span className="text-muted-foreground">{compact ? " bought " : ` in ${event.city} bought `}</span>
              <span className="font-medium">{event.productTitle}</span>
            </>
          ) : (
            <>
              <span className="font-semibold">Restocked</span>{" "}
              <span className="text-muted-foreground">
                {event.productTitle} +{event.quantity}
              </span>
            </>
          )}
        </p>
        {!compact && <p className="text-xs text-muted-foreground">{formatRelativeTime(event.at, now)}</p>}
      </div>
      {compact ? (
        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(event.at, now)}</span>
      ) : (
        event.amount !== undefined && (
          <span className="text-sm font-bold text-success">{formatPrice(event.amount)}</span>
        )
      )}
    </>
  );
  const cls = cn(
    "flex items-center gap-3",
    !compact && "gap-4 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted",
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
