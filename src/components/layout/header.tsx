"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Package, Search, ShoppingCart } from "lucide-react";
import { PRIMARY_NAV, isNavActive } from "@/config/navigation";
import { useScrolled } from "@/hooks";
import { cn } from "@/lib/utils";
import { useHydrated, useUiStore } from "@/store/ui-store";
import { useCartCount } from "@/features/cart/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { ThemeMenu } from "@/components/providers/theme";
import { Logo } from "@/components/layout/logo";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Icon with a small text label underneath, so every action explains itself. */
function HeaderAction({
  href,
  onClick,
  icon,
  label,
  count,
  className,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
  className?: string;
}) {
  const content = (
    <>
      <span className="relative">
        {icon}
        {count !== undefined && <CountBadge count={count} />}
      </span>
      <span className="text-[11px] font-medium leading-none max-sm:sr-only">{label}</span>
    </>
  );
  const cls = cn(
    "flex min-w-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground max-sm:size-10 max-sm:min-w-0",
    className,
  );
  const aria = count ? `${label} (${count})` : label;
  return href ? (
    <Link href={href} className={cls} aria-label={aria}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} aria-label={aria}>
      {content}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const hydrated = useHydrated();
  const cartCount = useCartCount();
  const wishCount = useWishlistStore((s) => s.ids.length);
  const { setCartOpen, setSearchOpen, setMobileNavOpen } = useUiStore.getState();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur transition-shadow print:hidden",
        scrolled && "shadow-soft",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:gap-6 lg:px-8">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg text-foreground/80 hover:bg-muted lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Logo />

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="ml-2 hidden h-11 flex-1 items-center gap-2.5 rounded-xl border border-border bg-subtle px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 md:flex lg:max-w-xl"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search for products, brands and more</span>
        </button>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <HeaderAction
            onClick={() => setSearchOpen(true)}
            icon={<Search className="size-5" />}
            label="Search"
            className="md:hidden"
          />
          <HeaderAction href="/orders" icon={<Package className="size-5" />} label="Orders" className="max-sm:hidden" />
          <HeaderAction
            href="/wishlist"
            icon={<Heart className="size-5" />}
            label="Wishlist"
            count={hydrated ? wishCount : undefined}
          />
          <HeaderAction
            onClick={() => setCartOpen(true)}
            icon={<ShoppingCart className="size-5" />}
            label="Cart"
            count={hydrated ? cartCount : undefined}
          />
          <ThemeMenu className="max-sm:hidden" />
        </div>
      </div>

      <nav aria-label="Primary" className="hidden border-t border-border lg:block">
        <ul className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {PRIMARY_NAV.map((link) => {
            const active = isNavActive(link.href, pathname);
            const highlight = "highlight" in link && link.highlight;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors",
                    highlight
                      ? "text-accent hover:bg-accent/10"
                      : active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/75 hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
