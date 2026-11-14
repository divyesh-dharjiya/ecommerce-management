import { formatPrice } from "@/lib/format";
import { cn, discountPercent } from "@/lib/utils";

export function Price({
  price,
  compareAtPrice,
  size = "md",
  className,
}: {
  price: number;
  compareAtPrice: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const off = discountPercent(price, compareAtPrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "tabular-nums",
          size === "sm" && "text-sm font-medium",
          size === "md" && "text-base font-bold",
          size === "lg" && "text-3xl font-bold tracking-tight",
        )}
      >
        {formatPrice(price)}
      </span>
      {off > 0 && compareAtPrice && (
        <>
          <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-lg" : "text-sm")}>
            {formatPrice(compareAtPrice)}
          </span>
          {size === "lg" && (
            <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-sm font-semibold text-accent">Save {off}%</span>
          )}
        </>
      )}
    </div>
  );
}
