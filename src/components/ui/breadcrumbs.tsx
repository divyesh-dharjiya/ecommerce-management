import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Visual breadcrumb trail + matching BreadcrumbList structured data,
 * so every page that shows breadcrumbs is also eligible for rich results.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
                {i > 0 && <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />}
                {c.href && !last ? (
                  <Link href={c.href} className="transition hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span className={cn("truncate", last && "text-foreground")} aria-current={last ? "page" : undefined}>
                    {c.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
