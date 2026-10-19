import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingProps {
  value: number;
  size?: number;
  showValue?: boolean;
  count?: number;
  className?: string;
}

/** Fractional star rating (e.g. 4.3 fills 4 stars + 30% of the fifth). */
export function Rating({ value, size = 14, showValue, count, className }: RatingProps) {
  const box = { width: size, height: size };
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className="relative" style={box}>
              <Star className="absolute inset-0 text-border" style={box} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="text-amber-400" style={box} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-xs font-semibold">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>}
    </div>
  );
}
