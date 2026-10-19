"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { PRIMARY_NAV, isNavActive } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { Drawer } from "@/components/ui";
import { ThemeSwitcher } from "@/components/providers/theme";

export function MobileNav() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const categories = useCatalogStore((s) => s.categories);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const linkClass = "flex items-center gap-2 rounded-md px-4 py-3 font-semibold transition hover:bg-muted";

  return (
    <Drawer open={open} onClose={close} side="left" title="Menu" className="max-w-xs">
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile">
        <ul className="space-y-1">
          {PRIMARY_NAV.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={close}
                className={cn(linkClass, isNavActive(l.href, pathname) && "bg-muted text-accent")}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin" onClick={close} className={linkClass}>
              <LayoutDashboard className="size-4" /> Admin dashboard
            </Link>
          </li>
        </ul>
        <p className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </p>
        <ul className="space-y-0.5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/categories/${c.slug}`}
                onClick={close}
                className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition hover:bg-muted"
              >
                <CategoryIcon name={c.icon} className="size-4 text-muted-foreground" />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center justify-between border-t border-border p-4">
        <span className="text-sm text-muted-foreground">Theme</span>
        <ThemeSwitcher />
      </div>
    </Drawer>
  );
}
