import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-card shadow-soft", className)} {...props} />;
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2", className)} aria-hidden>
      <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-success" />
      <span className="relative inline-flex size-2 rounded-full bg-success" />
    </span>
  );
}

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  /** Use "h1" when the empty state is the whole page (e.g. "Product not found"). */
  headingLevel?: "h1" | "h2";
}

export function EmptyState({ icon, title, description, action, className, headingLevel = "h2" }: EmptyStateProps) {
  const Heading = headingLevel;
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-20 text-center", className)}>
      <div className="relative mb-6 grid size-20 place-items-center rounded-lg bg-muted text-foreground">{icon}</div>
      <Heading className="font-display text-3xl">{title}</Heading>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
