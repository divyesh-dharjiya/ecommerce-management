"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { duration, ease, spring } from "@/lib/motion";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

/** Underlined tabs with an animated indicator and accessible tab/tabpanel wiring. */
export function Tabs({
  items,
  label,
  className,
  defaultId,
}: {
  items: TabItem[];
  label: string;
  className?: string;
  defaultId?: string;
}) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const uid = useId();
  const current = items.find((t) => t.id === active) ?? items[0];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = items.findIndex((t) => t.id === active);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    const target = items[(next + items.length) % items.length];
    if (!target) return;
    setActive(target.id);
    document.getElementById(`${uid}-tab-${target.id}`)?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-6 overflow-x-auto border-b border-border scrollbar-none"
      >
        {items.map((t) => {
          const selected = t.id === current?.id;
          return (
            <button
              key={t.id}
              id={`${uid}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative shrink-0 pb-4 text-sm font-semibold transition-colors",
                selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {selected && (
                <motion.span
                  layoutId={`${uid}-indicator`}
                  transition={spring.snappy}
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {current && (
          <motion.div
            key={current.id}
            id={`${uid}-panel-${current.id}`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${current.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: duration.fast, ease: ease.outQuart }}
            className="py-8"
          >
            {current.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
