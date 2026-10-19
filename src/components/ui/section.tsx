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
  as: Heading = "h2",
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3 text-accent">{eyebrow}</p>}
        <Heading className="font-display text-5xl sm:text-6xl">{title}</Heading>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {children}
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 transition hover:text-accent"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
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

/** Page hero with breadcrumbs (+ BreadcrumbList JSON-LD) and the page's h1. */
export function PageHeader({ title, description, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="border-b border-border">
      <Container className="py-10 sm:py-16">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
        <h1 className="font-display text-6xl sm:text-8xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>}
        {children}
      </Container>
    </div>
  );
}
