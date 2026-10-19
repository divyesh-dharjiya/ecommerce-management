"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  className?: string;
}

export type SortState = { id: string; dir: 1 | -1 };

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  /** Toolbar rendered above the table (search, filters…). */
  toolbar?: ReactNode;
  pageSize?: number;
  initialSort?: SortState;
  /** Enables row checkboxes and renders `bulkActions` while rows are selected. */
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  emptyMessage?: ReactNode;
  minWidth?: number;
  /** "card" wraps the table in a Card with footer; "plain" for embedding in panels. */
  variant?: "card" | "plain";
  /** Changing this resets to page 1 (pass the active filter key). */
  resetKey?: string;
}

/**
 * Generic, typed data table: column definitions, sorting, pagination and
 * multi-select with bulk actions. Filtering stays with the caller, which
 * passes already-filtered `rows`.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  toolbar,
  pageSize = 10,
  initialSort,
  bulkActions,
  onRowClick,
  rowClassName,
  emptyMessage = "Nothing to show.",
  minWidth = 760,
  variant = "card",
  resetKey = "",
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | undefined>(initialSort);
  const [pageState, setPageState] = useState({ key: resetKey, page: 1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectable = Boolean(bulkActions);
  const page = pageState.key === resetKey ? pageState.page : 1;
  const setPage = (p: number) => setPageState({ key: resetKey, page: p });

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.id === sort.id);
    if (!col?.sortValue || !sort) return rows;
    const value = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      return (typeof av === "string" ? av.localeCompare(String(bv)) : av - (bv as number)) * sort.dir;
    });
  }, [rows, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected.has(getRowId(r)));
  // Drop selections for rows that no longer exist (e.g. deleted elsewhere).
  const liveIds = new Set(rows.map(getRowId));
  const selectedIds = [...selected].filter((id) => liveIds.has(id));

  const toggleSort = (id: string) =>
    setSort((s) => (s?.id === id ? { id, dir: s.dir === 1 ? -1 : 1 } : { id, dir: 1 }));

  const toggle = (ids: string[], on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      ids.forEach((id) => (on ? n.add(id) : n.delete(id)));
      return n;
    });

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allOnPage}
                  onChange={() => toggle(pageRows.map(getRowId), !allOnPage)}
                  aria-label="Select all rows on this page"
                  className="size-4 accent-[var(--primary)]"
                />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.id === c.id;
              return (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
                  className={cn(
                    "px-3 py-3 font-medium first:pl-5 last:pr-5",
                    c.align === "right" && "text-right",
                    c.className,
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.id)}
                      className="inline-flex items-center gap-1 uppercase transition hover:text-foreground"
                    >
                      {c.header}
                      {!active ? (
                        <ArrowUpDown className="size-3 opacity-50" />
                      ) : sort.dir === 1 ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-16 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {pageRows.map((row) => {
            const id = getRowId(row);
            const isSelected = selected.has(id);
            return (
              <tr
                key={id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-border transition-colors last:border-0 hover:bg-muted/40",
                  onRowClick && "cursor-pointer",
                  isSelected && "bg-accent/5",
                  rowClassName?.(row),
                )}
              >
                {selectable && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle([id], !isSelected)}
                      aria-label="Select row"
                      className="size-4 accent-[var(--primary)]"
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn("px-3 py-3 first:pl-5 last:pr-5", c.align === "right" && "text-right", c.className)}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (variant === "plain") return table;

  return (
    <Card className="overflow-hidden">
      {toolbar && <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">{toolbar}</div>}
      {selectable && selectedIds.length > 0 && (
        <div className="flex animate-fade-in items-center justify-between gap-3 bg-accent/5 px-4 py-2.5 text-sm">
          <span className="font-medium">{selectedIds.length} selected</span>
          <div className="flex gap-2">{bulkActions?.(selectedIds, () => setSelected(new Set()))}</div>
        </div>
      )}
      {table}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-sm text-muted-foreground">
        <span>
          Showing {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
        </span>
        <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
      </div>
    </Card>
  );
}
