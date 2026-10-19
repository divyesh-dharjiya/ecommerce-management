import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page numbers with ellipses, e.g. [1, "…", 4, 5, 6, "…", 12]. */
export function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < pageCount - 1) pages.push("…");
  pages.push(pageCount);
  return pages;
}

export interface PaginationProps {
  page: number;
  pageCount: number;
  /** Crawlable mode: render real links (preferred for public listing pages). */
  getHref?: (page: number) => string;
  /** Stateful mode: in-memory paging (admin tables). */
  onChange?: (page: number) => void;
  className?: string;
}

const base = "grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-semibold transition";

interface ItemProps {
  to: number;
  label?: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  getHref?: (page: number) => string;
  onChange?: (page: number) => void;
}

function Item({ to, label, children, active, disabled, getHref, onChange }: ItemProps) {
  const cls = cn(base, active ? "bg-foreground text-background" : "hover:bg-muted", disabled && "pointer-events-none opacity-40");
  const common = { "aria-label": label, "aria-current": active ? ("page" as const) : undefined, className: cls };
  if (getHref) {
    return disabled ? (
      <span {...common} aria-disabled>{children}</span>
    ) : (
      <Link href={getHref(to)} {...common}>{children}</Link>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={() => onChange?.(to)} {...common}>
      {children}
    </button>
  );
}

export function Pagination({ page, pageCount, getHref, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5", className)}>
      <Item getHref={getHref} onChange={onChange} to={page - 1} label="Previous page" disabled={page <= 1}>
        <ChevronLeft className="size-4" />
      </Item>
      {pageWindow(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted-foreground">…</span>
        ) : (
          <Item getHref={getHref} onChange={onChange} key={p} to={p} active={p === page} label={`Page ${p}`}>
            {p}
          </Item>
        ),
      )}
      <Item getHref={getHref} onChange={onChange} to={page + 1} label="Next page" disabled={page >= pageCount}>
        <ChevronRight className="size-4" />
      </Item>
    </nav>
  );
}
