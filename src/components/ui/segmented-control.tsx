"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Accessible label when `label` is an icon. */
  ariaLabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "sm" | "md";
  variant?: "pill" | "solid";
  className?: string;
}

/**
 * Animated pill selector (tabs, ranges, view toggles). The active indicator
 * glides between options using a shared layout animation scoped per instance.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  variant = "pill",
  className,
}: SegmentedControlProps<T>) {
  const layoutId = useId();

  // WAI-ARIA radio group: arrows move + select, Home/End jump, only the active option is tabbable.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const group = e.currentTarget; // React clears currentTarget once the handler returns
    const i = options.findIndex((o) => o.value === value);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? options.length - 1
          : (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    const target = options[next];
    if (!target) return;
    onChange(target.value);
    requestAnimationFrame(() => group.querySelectorAll<HTMLButtonElement>("[role=radio]")[next]?.focus());
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex items-center gap-0.5 p-1",
        variant === "pill" ? "rounded-full bg-muted" : "rounded-md border border-border bg-card",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.ariaLabel}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative inline-flex items-center justify-center gap-1.5 font-semibold transition-colors",
              size === "sm" ? "h-8 min-w-8 px-3 text-xs" : "h-9 min-w-9 px-4 text-sm",
              variant === "pill" ? "rounded-full" : "rounded-lg",
              active
                ? variant === "pill"
                  ? "text-foreground"
                  : "text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={spring.snappy}
                className={cn(
                  "absolute inset-0",
                  variant === "pill" ? "rounded-full bg-card shadow-soft" : "rounded-lg bg-foreground",
                )}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
