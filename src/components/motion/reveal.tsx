"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { stagger, variants, type VariantName } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: VariantName;
  delay?: number;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
}

/** Animates its content into view once, the first time it scrolls on screen. */
export function Reveal({ children, className, variant = "fadeUp", delay = 0, amount = 0.2 }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  step?: number;
  delay?: number;
  amount?: number;
  as?: "div" | "ul" | "ol";
}

/** Container that reveals its `StaggerItem` children one after another. */
export function Stagger({ children, className, step = 0.06, delay = 0, amount = 0.1, as = "div" }: StaggerProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      variants={stagger(step, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  variant = "fadeUp",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  variant?: VariantName;
  as?: "div" | "li";
}) {
  const Component = motion[as];
  return (
    <Component className={className} variants={variants[variant]}>
      {children}
    </Component>
  );
}
