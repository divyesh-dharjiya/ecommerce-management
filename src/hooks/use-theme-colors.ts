"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/providers/theme";

const TOKENS = ["primary", "muted-foreground", "border", "muted", "card"] as const;
type Token = (typeof TOKENS)[number];

/**
 * Resolves design tokens to concrete colour strings. SVG presentation
 * attributes (used by Recharts) can't resolve `var(--x)`, so charts read
 * the computed values and re-resolve whenever the theme flips.
 */
export function useThemeColors(): Record<Token, string> {
  const { resolved } = useTheme();
  return useMemo(() => {
    const fallback = Object.fromEntries(TOKENS.map((t) => [t, "#888"])) as Record<Token, string>;
    if (typeof window === "undefined") return fallback;
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      TOKENS.map((t) => [t, styles.getPropertyValue(`--${t}`).trim() || fallback[t]]),
    ) as Record<Token, string>;
    // `resolved` is the invalidation key: tokens change when the theme class toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);
}
