"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, CornerDownLeft, Search, TrendingUp } from "lucide-react";
import { useDebounce, useKeydown, useLockBodyScroll } from "@/hooks";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { queryProducts } from "@/features/catalog/services/catalog";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { useUiStore } from "@/store/ui-store";
import { Thumb } from "@/components/ui";

const TRENDING = ["iPhone", "Watch", "Perfume", "Sunglasses", "Laptop", "Sneakers"];

/** Global ⌘K / Ctrl+K instant-search palette with keyboard navigation. */
export function SearchCommand() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useUiStore.getState().searchOpen);
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useLockBodyScroll(open);
  useKeydown("Escape", () => setOpen(false), open);

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 380 }}
            className="fixed inset-x-3 top-[8vh] z-50 mx-auto max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-lift"
          >
            <SearchBody onClose={() => setOpen(false)} />
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SearchBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const products = useCatalogStore((s) => s.products);
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const debounced = useDebounce(term, 120);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(
    () => (debounced.trim() ? queryProducts(products, { search: debounced, pageSize: 7 }) : null),
    [products, debounced],
  );
  const items = results?.items ?? [];

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = items[active];
      if (target && active < items.length) go(`/products/${target.slug}`);
      else if (term.trim()) go(`/products?q=${encodeURIComponent(term.trim())}`);
    }
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div onKeyDown={onKeyDown}>
      <div className="flex items-center gap-3 border-b border-border px-5">
        <Search className="size-5 text-muted-foreground" />
        <input
          autoFocus
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setActive(0);
          }}
          placeholder="Search 250+ products, brands, categories…"
          className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          aria-label="Search"
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls="search-results"
        />
        <kbd className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ESC
        </kbd>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-2">
        {!results && (
          <div className="p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="size-3.5" /> Trending searches
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {results && items.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No results for <span className="font-semibold text-foreground">“{debounced}”</span>. Try a different term.
          </p>
        )}

        {items.length > 0 && (
          <ul id="search-results" ref={listRef} role="listbox">
            {items.map((p, i) => (
              <li key={p.id} data-index={i} role="option" aria-selected={active === i}>
                <Link
                  href={`/products/${p.slug}`}
                  onClick={onClose}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex items-center gap-4 rounded-lg p-2.5 transition", active === i && "bg-muted")}
                >
                  <Thumb src={p.thumbnail} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="truncate text-xs capitalize text-muted-foreground">
                      {p.brand} · {p.category.replace(/-/g, " ")}
                    </p>
                  </div>
                  <span className="font-semibold">{formatPrice(p.price)}</span>
                  {active === i && <CornerDownLeft className="size-4 text-muted-foreground" />}
                </Link>
              </li>
            ))}
            <li data-index={items.length}>
              <button
                type="button"
                onClick={() => go(`/products?q=${encodeURIComponent(term.trim())}`)}
                onMouseEnter={() => setActive(items.length)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-primary transition",
                  active === items.length && "bg-primary/10",
                )}
              >
                See all {results?.total} results for “{term.trim()}”
                <ArrowRight className="size-4" />
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
