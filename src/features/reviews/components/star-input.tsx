"use client";

import { useId } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

/** Five-star picker built on native radio buttons, so arrow keys and screen readers work out of the box. */
export function StarInput({
  value,
  onChange,
  invalid,
  describedBy,
}: {
  value: number;
  onChange: (stars: number) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label="Your rating"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="flex items-center gap-1"
    >
      {LABELS.map((label, i) => {
        const stars = i + 1;
        return (
          <label
            key={stars}
            className="group cursor-pointer rounded-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
          >
            <input
              type="radio"
              name={name}
              value={stars}
              checked={value === stars}
              onChange={() => onChange(stars)}
              className="sr-only"
              aria-label={`${stars} star${stars > 1 ? "s" : ""}: ${label}`}
            />
            <Star
              aria-hidden
              strokeWidth={1.5}
              className={cn(
                "size-7 transition",
                stars <= value ? "fill-amber-400 text-amber-400" : "text-border group-hover:text-amber-300",
              )}
            />
          </label>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground" aria-hidden>
        {value ? LABELS[value - 1] : "Select a rating"}
      </span>
    </div>
  );
}
