import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-muted text-foreground/80",
  primary: "bg-accent/12 text-accent",
  success: "bg-success/15 text-success",
  danger: "bg-danger/12 text-danger",
  warning: "bg-warning/20 text-amber-700 dark:text-warning",
  solid: "bg-foreground text-background",
  sale: "bg-accent text-accent-foreground",
} as const;

export type BadgeTone = keyof typeof tones;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-semibold leading-none tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
