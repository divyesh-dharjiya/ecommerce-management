import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-muted text-foreground/80",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  danger: "bg-danger/12 text-danger",
  warning: "bg-warning/15 text-warning",
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
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
