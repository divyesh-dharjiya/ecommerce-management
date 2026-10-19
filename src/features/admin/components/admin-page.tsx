import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";

/** Consistent title row for every admin screen. */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex animate-fade-up flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Titled card used for dashboard widgets and settings groups. */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}
