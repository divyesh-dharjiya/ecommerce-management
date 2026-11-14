import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  /** id for the heading, so a section can point `aria-labelledby` at it. */
  id?: string;
  /** Heading level — keep the document outline valid (one h1 per page). */
  as?: "h1" | "h2";
  children?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  className,
  id,
  as: Heading = "h2",
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="mb-1 text-sm font-semibold text-primary">{eyebrow}</p>}
        <Heading id={id} className="font-display text-2xl sm:text-3xl">
          {title}
        </Heading>
        {description && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {children}
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 rounded-lg px-1 text-sm font-semibold text-primary transition hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
}

/** Page title block with breadcrumbs (+ BreadcrumbList JSON-LD) and the page's h1. */
export function PageHeader({ title, description, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-subtle">
      <Container className="py-6 sm:py-8">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-3" />}
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>}
        {children}
      </Container>
    </div>
  );
}
