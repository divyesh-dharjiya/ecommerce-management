"use client";

import { useEffect, useRef } from "react";
import { animate, m } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

/** Smoothly tweens between values so live updates feel alive rather than jumpy. */
export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: ease.outExpo,
      onUpdate: (v) => (node.textContent = format(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, format]);
  return <span ref={ref}>{format(value)}</span>;
}

export function StatCard({
  label,
  value,
  format,
  change,
  icon: Icon,
  hint,
  index = 0,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  change: number | null;
  icon: LucideIcon;
  hint?: string;
  index?: number;
}) {
  const up = (change ?? 0) >= 0;
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-lg border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">
        <AnimatedNumber value={value} format={format} />
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {change !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
              up ? "bg-success/15 text-success" : "bg-danger/12 text-danger",
            )}
          >
            {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        <span className="text-muted-foreground">{hint ?? "vs previous period"}</span>
      </div>
    </m.div>
  );
}
