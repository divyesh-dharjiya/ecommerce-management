"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useKeydown, useLockBodyScroll } from "@/hooks";
import { cn } from "@/lib/utils";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

function useFocusOnOpen(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const focusable = ref.current?.querySelector<HTMLElement>(
        "[data-autofocus], input, button, [href], select, textarea",
      );
      (focusable ?? ref.current)?.focus();
    }, 50);
    return () => {
      clearTimeout(t);
      previous?.focus?.();
    };
  }, [open]);
  return ref;
}

const Backdrop = ({ onClick }: { onClick: () => void }) => (
  <motion.div
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    aria-hidden
  />
);

export function Modal({ open, onClose, title, children, className }: OverlayProps) {
  const titleId = useId();
  const ref = useFocusOnOpen(open);
  useLockBodyScroll(open);
  useKeydown("Escape", onClose, open);

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className={cn(
                "pointer-events-auto relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card shadow-lift outline-none",
                className,
              )}
            >
              {title && (
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur">
                  <h2 id={titleId} className="text-lg font-bold tracking-tight">
                    {title}
                  </h2>
                  <CloseButton onClick={onClose} />
                </div>
              )}
              {!title && <CloseButton onClick={onClose} className="absolute right-4 top-4 z-10" />}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  className,
  side = "right",
}: OverlayProps & { side?: "left" | "right" }) {
  const titleId = useId();
  const ref = useFocusOnOpen(open);
  useLockBodyScroll(open);
  useKeydown("Escape", onClose, open);
  const offset = side === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ x: offset }}
            animate={{ x: 0 }}
            exit={{ x: offset }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className={cn(
              "fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-card shadow-lift outline-none",
              side === "right" ? "right-0" : "left-0",
              className,
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 id={titleId} className="text-lg font-bold tracking-tight">
                {title}
              </h2>
              <CloseButton onClick={onClose} />
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn(
        "grid size-9 place-items-center rounded-full bg-muted/80 text-foreground/70 transition hover:rotate-90 hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <X className="size-4" />
    </button>
  );
}
