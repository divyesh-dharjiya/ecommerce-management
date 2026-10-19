"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";

export interface MenuItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface DropdownMenuProps<T extends string> {
  /** Renders the trigger; receives props that must be spread on a <button>. */
  trigger: (props: {
    onClick: (e: React.MouseEvent) => void;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
  }) => ReactNode;
  items: readonly MenuItem<T>[];
  value?: T;
  onSelect: (value: T) => void;
  align?: "start" | "end";
  className?: string;
}

/** Accessible popover menu: click-outside, Escape and arrow-key navigation. */
export function DropdownMenu<T extends string>({
  trigger,
  items,
  value,
  onSelect,
  align = "end",
  className,
}: DropdownMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]") ?? [])];
      const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") (buttons[(i + 1) % buttons.length] ?? buttons[0])?.focus();
      if (e.key === "ArrowUp") (buttons[(i - 1 + buttons.length) % buttons.length] ?? buttons[0])?.focus();
      if (e.key.startsWith("Arrow")) e.preventDefault();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    const t = setTimeout(
      () => list.current?.querySelector<HTMLButtonElement>("[aria-checked=true], [role=menuitemradio]")?.focus(),
      30,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", className)}>
      {trigger({
        onClick: () => setOpen((o) => !o),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={list}
            id={id}
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: duration.fast, ease: ease.outQuart }}
            className={cn(
              "absolute top-full z-50 mt-2 min-w-40 origin-top rounded-lg border border-border bg-card p-1.5 shadow-lift",
              align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            )}
          >
            {items.map((item) => (
              <button
                key={item.value}
                type="button"
                role="menuitemradio"
                aria-checked={item.value === value}
                onClick={() => {
                  onSelect(item.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium outline-none transition hover:bg-muted focus-visible:bg-muted"
              >
                {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.value === value && <Check className="size-4 text-accent" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
