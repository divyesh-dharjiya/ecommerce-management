import type { ReactNode } from "react";

/**
 * Layout wrappers for sections and lists.
 *
 * These used to fade content in on scroll. That made pages *feel* slow —
 * content that was already loaded stayed invisible until it was scrolled to
 * and animated — so they now render immediately. Motion is reserved for
 * interactions (menus, drawers, toggles, hover), where it aids feedback.
 * The API is kept so sections stay unchanged.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string; [key: string]: unknown }) {
  return <div className={className}>{children}</div>;
}

export function Stagger({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
  [key: string]: unknown;
}) {
  return <Component className={className}>{children}</Component>;
}

export function StaggerItem({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  [key: string]: unknown;
}) {
  return <Component className={className}>{children}</Component>;
}
