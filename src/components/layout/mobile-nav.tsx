"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { PRIMARY_NAV, isNavActive } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { useCatalogStore } from "@/features/catalog/store/catalog-store";
import { CategoryIcon } from "@/features/catalog/components/category-icon";
import { Drawer } from "@/components/ui";
import { ThemeSwitcher } from "@/components/providers/theme";

const ACCOUNT_LINKS = [
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/orders", label: "My orders", icon: Package },
  { href: "/admin", label: "Store admin", icon: LayoutDashboard },
];

export function MobileNav() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const categories = useCatalogStore((s) => s.categories);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const linkClass = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted";
  const heading = "mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <Drawer open={open} onClose={close} side="left" title="Menu" className="max-w-xs">
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={close}
                className={cn(
                  linkClass,
                  "highlight" in l && l.highlight && "text-accent",
                  isNavActive(l.href, pathname) && "bg-primary/10 text-primary",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className={heading}>Your account</p>
        <ul className="space-y-0.5">
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} onClick={close} className={linkClass}>
                <Icon className="size-4 text-muted-foreground" /> {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className={heading}>Categories</p>
        <ul className="space-y-0.5">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/categories/${c.slug}`} onClick={close} className={cn(linkClass, "font-normal")}>
                <CategoryIcon name={c.icon} className="size-4 text-muted-foreground" />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center justify-between border-t border-border p-4">
        <span className="text-sm text-muted-foreground">Appearance</span>
        <ThemeSwitcher />
      </div>
    </Drawer>
  );
}
