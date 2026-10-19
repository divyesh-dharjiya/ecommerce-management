import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-muted text-foreground/80",
  primary: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  danger: "bg-danger/12 text-danger",
  warning: "bg-warning/20 text-amber-700 dark:text-warning",
  solid: "bg-foreground text-background",
  sale: "bg-gradient-to-r from-rose-500 to-orange-500 text-white",
} as const;

export type BadgeTone = keyof typeof tones;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
