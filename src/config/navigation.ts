/** Single source of truth for site navigation (header, mobile menu, footer). */
export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop all" },
  { href: "/categories", label: "Categories" },
  { href: "/products?sort=newest", label: "New arrivals" },
  { href: "/products?sort=best-selling", label: "Best sellers" },
  { href: "/products?onSale=1&sort=discount", label: "Deals", highlight: true },
] as const;

export const FOOTER_NAV = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?sort=newest", label: "New arrivals" },
      { href: "/products?sort=best-selling", label: "Best sellers" },
      { href: "/products?onSale=1&sort=discount", label: "Deals" },
    ],
  },
  {
    title: "Popular",
    links: [
      { href: "/categories/smartphones", label: "Smartphones" },
      { href: "/categories/laptops", label: "Laptops" },
      { href: "/categories/fragrances", label: "Fragrances" },
      { href: "/categories/womens-bags", label: "Women's bags" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/cart", label: "Cart" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/orders", label: "My orders" },
      { href: "/admin", label: "Store admin" },
    ],
  },
] as const;

/** Whether a nav link should render as active for the current path. */
export function isNavActive(href: string, pathname: string) {
  if (href.includes("?")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
