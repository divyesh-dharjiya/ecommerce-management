"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside a dialog while `active`:
 *  - moves focus into the dialog on open (first `[data-autofocus]`, else first focusable)
 *  - keeps Tab / Shift+Tab cycling within it
 *  - restores focus to the previously focused element on close
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;

    // Style-based (not layout-based) visibility: offsetParent is null for fixed elements and in jsdom.
    const isVisible = (el: HTMLElement) => {
      const style = getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden" && el.getAttribute("aria-hidden") !== "true";
    };
    const focusables = () => [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isVisible);

    const start = setTimeout(() => {
      const target = node.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? node;
      target.focus();
    }, 40);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      } else if (!node.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(start);
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [active]);

  return ref;
}
