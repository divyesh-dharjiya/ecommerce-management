"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { m } from "framer-motion";
import { FolderTree, LayoutDashboard, Menu, Package, Receipt, Search, Settings, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { usePreferencesStore } from "@/store/preferences-store";
import { useUiStore } from "@/store/ui-store";
import { Drawer, LiveDot } from "@/components/ui";
import { ThemeMenu } from "@/components/providers/theme";
import { Logo } from "@/components/layout/logo";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Admin">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId="admin-nav"
                className="absolute inset-0 -z-0 rounded-md bg-primary shadow-md shadow-primary/30"
                transition={spring.snappy}
              />
            )}
            <Icon className="relative size-[18px]" />
            <span className="relative">{label}</span>
          </Link>
        );
      })}
      <div className="mt-auto">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <Store className="size-[18px]" /> View storefront
        </Link>
      </div>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const live = usePreferencesStore((s) => s.liveSimulation);
  const openSearch = useUiStore((s) => s.setSearchOpen);

  return (
    <div className="min-h-dvh bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo href="/admin" />
          <span className="ml-2 rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            Admin
          </span>
        </div>
        <SidebarNav />
      </aside>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" title="Luxe Admin" className="max-w-xs">
        <SidebarNav onNavigate={() => setNavOpen(false)} />
      </Drawer>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 backdrop-blur-xl backdrop-saturate-150 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="grid size-10 place-items-center rounded-md hover:bg-muted lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => openSearch(true)}
            className="flex h-10 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-card px-3.5 text-sm text-muted-foreground transition hover:border-primary/40"
          >
            <Search className="size-4" /> Search catalogue…
            <kbd className="ml-auto hidden rounded border border-border px-1.5 font-mono text-[10px] sm:inline">
              Ctrl K
            </kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/settings"
              className={cn(
                "hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex",
                live ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground",
              )}
            >
              {live ? <LiveDot /> : <span className="size-2 rounded-full bg-muted-foreground" />}
              {live ? "Live" : "Paused"}
            </Link>
            <ThemeMenu />
            <span
              className="grid size-9 place-items-center rounded-full bg-foreground text-background"
              aria-label="Signed in as Admin"
            >
              AD
            </span>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
