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

export function SectionHeading({ eyebrow, title, description, href, linkLabel = "View all", className, as: Heading = "h2", children }: SectionHeadingProps) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <Heading className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</Heading>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {children}
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 transition hover:text-primary">
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
    <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/60 to-background">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Container className="relative py-10 sm:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4 animate-fade-in" />}
        <h1 className="animate-fade-up font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl animate-fade-up text-muted-foreground [animation-delay:80ms]">{description}</p>
        )}
        {children}
      </Container>
    </div>
  );
}
