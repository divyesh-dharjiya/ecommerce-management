import type { Transition, Variants } from "framer-motion";

/**
 * Motion design tokens. Every animation in the app pulls from here so timing
 * and feel stay consistent. CSS equivalents live in globals.css
 * (`--ease-out-expo`, `animate-fade-up`, …) for server-rendered entrances.
 */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.6,
} as const;

export const spring = {
  /** UI chrome: tabs, toggles, indicators. */
  snappy: { type: "spring", stiffness: 520, damping: 40, mass: 0.8 },
  /** Panels, drawers, modals. */
  gentle: { type: "spring", stiffness: 320, damping: 34 },
  /** Playful feedback: badges, hearts, success marks. */
  bouncy: { type: "spring", stiffness: 480, damping: 18 },
} as const satisfies Record<string, Transition>;

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: duration.base, ease: ease.outQuart } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    show: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.outExpo } },
  },
} satisfies Record<string, Variants>;

export type VariantName = keyof typeof variants;

export const stagger = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Inline style for CSS-driven staggered entrances (works before hydration). */
export const staggerDelay = (index: number, step = 45, max = 12) => ({
  animationDelay: `${Math.min(index, max) * step}ms`,
});
