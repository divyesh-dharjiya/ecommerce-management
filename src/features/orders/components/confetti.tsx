"use client";

import { m } from "framer-motion";

const COLORS = ["#8b5cf6", "#ec4899", "#f97316", "#22c55e", "#3b82f6", "#eab308"];

/** One-off celebration shown after an order is placed. Decorative only. */
export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {Array.from({ length: 60 }, (_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 10) * 0.05;
        const rotate = (i * 47) % 360;
        return (
          <m.span
            key={i}
            className="absolute top-0 block h-3 w-1.5 rounded-sm"
            style={{ left: `${left}%`, backgroundColor: COLORS[i % COLORS.length] }}
            initial={{ y: -20, opacity: 1, rotate }}
            animate={{ y: "105vh", opacity: [1, 1, 0], rotate: rotate + 540, x: ((i % 7) - 3) * 30 }}
            transition={{ duration: 2.4 + (i % 5) * 0.3, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
