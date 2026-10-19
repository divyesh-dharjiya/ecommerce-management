"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, LayoutDashboard, Menu, Search, ShoppingBag } from "lucide-react";
import { PRIMARY_NAV, isNavActive } from "@/config/navigation";
import { useScrolled } from "@/hooks";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useHydrated, useUiStore } from "@/store/ui-store";
import { useCartCount } from "@/features/cart/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { ThemeMenu } from "@/components/providers/theme";
import { Logo } from "@/components/layout/logo";

const iconButton =
  "relative grid size-10 place-items-center rounded-full text-foreground/80 transition hover:bg-muted hover:text-foreground";

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={spring.bouncy}
          className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function PrimaryNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="ml-8 hidden items-center gap-2 lg:flex">
      {PRIMARY_NAV.map((link) => {
        const active = isNavActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-16 items-center px-3 text-sm font-medium transition-colors lg:h-[72px]",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
            {active && (
              <motion.span
                layoutId="nav-underline"
                className="absolute inset-x-3 -bottom-px h-px bg-foreground"
                transition={spring.snappy}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const scrolled = useScrolled();
  const hydrated = useHydrated();
  const cartCount = useCartCount();
  const wishCount = useWishlistStore((s) => s.ids.length);
  const { setCartOpen, setSearchOpen, setMobileNavOpen } = useUiStore.getState();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-border bg-background/90 backdrop-blur-xl backdrop-saturate-150"
          : "border-border bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <button
          type="button"
          className={cn(iconButton, "lg:hidden")}
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Logo />
        <PrimaryNav />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mr-1 hidden h-10 w-56 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-3.5 text-sm text-muted-foreground transition hover:border-foreground/40 md:flex xl:w-72"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Search products…</span>
            <kbd className="ml-auto rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl K
            </kbd>
          </button>
          <button
            type="button"
            className={cn(iconButton, "md:hidden")}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>
          <ThemeMenu className="max-sm:hidden" />
          <Link
            href="/admin"
            className={cn(iconButton, "max-sm:hidden")}
            aria-label="Admin dashboard"
            title="Admin dashboard"
          >
            <LayoutDashboard className="size-5" />
          </Link>
          <Link href="/wishlist" className={iconButton} aria-label={`Wishlist (${wishCount})`}>
            <Heart className="size-5" />
            {hydrated && <CountBadge count={wishCount} />}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className={iconButton}
            aria-label={`Open bag (${cartCount} items)`}
          >
            <ShoppingBag className="size-5" />
            {hydrated && <CountBadge count={cartCount} />}
          </button>
        </div>
      </div>
    </header>
  );
}
