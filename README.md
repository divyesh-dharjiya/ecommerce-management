# Luxe Commerce

A Next.js 16 e-commerce storefront and admin dashboard. It ships with a 100-product catalog and simulated live store activity, and it keeps all data in `localStorage`, so it runs without a backend.

![stack](https://img.shields.io/badge/Next.js-16-black) ![react](https://img.shields.io/badge/React-19-61dafb) ![ts](https://img.shields.io/badge/TypeScript-strict-3178c6) ![tw](https://img.shields.io/badge/Tailwind-v4-38bdf8)

---

## Quick start

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL for production
npm run dev                  # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` / `npm start` | Build for production (244 pre-rendered routes, including OG images) and serve it |
| `npm run check` | Type-check, lint and unit tests (run this before every PR) |
| `npm test` | Vitest unit tests for the business logic |
| `npm run seed:generate` | Regenerate `src/data/*.json` from the DummyJSON catalog |

Admin dashboard: **`/admin`**. Demo coupon codes: `WELCOME10`, `LUXE20`, `SAVE15`, `FREESHIP`.

---

## Features

### Storefront
- **Home page**: animated hero with floating products, brand marquee, category rail, tabbed collections (trending, new, top rated), flash deals with a live countdown, bento promo tiles, live purchase feed and recently viewed items.
- **Catalog with 100 products** in 24 categories, each with real product images, a gallery, reviews, specs, stock levels and discounts.
- **Search**: a global ⌘K / Ctrl+K command palette with keyboard navigation, plus weighted relevance ranking.
- **Filtering and sorting**: category, brand, price, rating, stock and sale filters, with 7 sort orders. All filter state lives in the URL, so it can be shared, bookmarked and survives the back button.
- **Product page**: zoom on hover, buy now, wishlist, share, a live viewer count, a stock meter, a delivery estimate, specs and reviews tabs, and related products.
- **Cart**: slide-over drawer and full page, free-shipping progress meter, undo on remove, stock-aware quantity limits and coupons.
- **Checkout**: validated form, payment method choice, simulated payment authorization, and an order confirmation page with confetti.
- **Order history and tracking**, wishlist, a light / dark / system theme, and a fully responsive layout.

### Admin (`/admin`)
- **Dashboard**: KPI cards with period-over-period change, a 7/30/60-day revenue chart, a per-minute live sales chart, a live activity stream, sales by category, top products, low-stock alerts with one-click restock, and recent orders.
- **Products**: create, edit and delete, with search, filters, sortable columns, pagination, bulk delete and inline status changes.
- **Categories**: create, edit and delete, with icon and color pickers. Deleting a category lets you move its products to another category or delete them too.
- **Orders**: status filter, search, a detail modal, status workflow and CSV export.
- **Settings**: theme, live-simulation toggles, JSON backup export and import, store reset, and storage usage.

### Live data
- **Simulated shoppers.** Realistic orders arrive every 5–11 seconds. Each one lowers stock, increases sold counts, feeds the dashboard and shows social-proof toasts on the storefront.
- **Leader election.** Only one browser tab runs the simulation, chosen through a `localStorage` lease with a heartbeat (`features/live/services/leader-election.ts`). Events reach the other tabs through `BroadcastChannel`.
- **Cross-tab sync.** Every persisted store rehydrates when it receives a `storage` event, so admin edits appear instantly in storefront tabs.
- **Moving to a real backend**: replace `tickSimulation()` in `features/live/components/live-engine.tsx` with a WebSocket or SSE subscription. The stores and UI don't change.

---

## Architecture

Code is organized **by feature**. Each feature owns its components, hooks, services (pure logic) and store, and features share one design system.

```
src/
├── app/                  Routes only: thin server components (metadata, SSG, OG images)
├── components/
│   ├── ui/               Design system, one component per file, imported from "@/components/ui"
│   ├── motion/           Reveal / Stagger scroll animations
│   ├── seo/              JsonLd
│   ├── layout/           Header, footer, mobile nav, search palette
│   └── providers/        App providers, store hydration, ClientGate, theme controls
├── features/
│   ├── catalog/          Listing, filters, product page, URL query hook, search/sort services
│   ├── cart/             Cart store, pricing service, drawer, summary, coupons
│   ├── checkout/         Shipping fields, payment picker, address storage, validation
│   ├── orders/           Order store, history, tracking timeline
│   ├── wishlist/         Wishlist store and page
│   ├── live/             Realtime engine, leader election, simulation, feeds and toasts
│   ├── home/             Home page sections
│   └── admin/            Dashboard widgets, table screens, forms, analytics service
├── hooks/                Generic hooks (useForm, useStableOrder, useDebounce, useNow, …)
├── lib/                  seo, theme, motion, og, format, validation, storage, download
├── config/               Site, navigation and coupon configuration
└── store/ types/ data/
```

### Reusable building blocks
| Building block | What it does | Used by |
| --- | --- | --- |
| `DataTable<T>` | Typed table driven by column definitions: sorting, pagination, multi-select, bulk actions, row click | Admin products, orders, recent orders |
| `useForm<T>` | Values, field errors, validation and accessible `bind(field)` bindings | Checkout, product form, category form |
| `useStableOrder` | Keeps a sorted list in place while live data changes underneath | Shop grid, home collections |
| `useProductQuery` | Reads and writes the listing state in the URL | Shop page and every category page |
| `SegmentedControl`, `Tabs`, `DropdownMenu` | Accessible, animated selection controls | Theme, view toggle, date ranges, status filter, product tabs |
| `Breadcrumbs` | Visual breadcrumbs plus BreadcrumbList JSON-LD | Every page with breadcrumbs |
| `ClientGate`, `Thumb`, `SearchInput`, `Panel`, `AdminPageHeader` | Shared patterns that remove repeated markup | Across features |

### Theme
- **Three modes:** Light, Dark and **System**, which follows the OS setting as it changes. The choice is saved, synced across tabs, and mirrored to `<meta name="theme-color">`.
- **No flash on load:** an inline script applies the theme before the first paint.
- **Animated switch:** switching plays a circular reveal from the toggle using the View Transitions API. Unsupported browsers and reduced-motion users get an instant switch.
- **Tokens:** semantic colors are tuned separately for each mode in `globals.css`. Charts resolve them through `useThemeColors`.

### Motion
- **One source of tokens:** easing, durations and springs live in `lib/motion.ts`, with matching CSS variables.
- **Content above the fold animates with CSS:** `animate-fade-up` and staggered delays play on first paint, so the hero, headings and product grids never wait for JavaScript and never render blank.
- **Content below the fold uses `Reveal` / `Stagger`:** each section animates once, when it scrolls into view.
- **Page transitions:** `template.tsx` gives each page a short entrance.
- **Reduced motion:** `prefers-reduced-motion` is respected everywhere, through both CSS and `MotionConfig`.

### SEO
- **Metadata:** `buildMetadata()` (`lib/seo.ts`) gives every route a canonical URL, Open Graph and Twitter cards. Set `NEXT_PUBLIC_SITE_URL` in production.
- **Structured data (JSON-LD):** Organization and WebSite with a search box, Product with offers, ratings and reviews, BreadcrumbList, and ItemList on listing pages.
- **Generated share images:** for the site, each of the 100 products (photo, price, rating) and each category, plus the app icons and the web manifest.
- **Crawlable listings:** listing pages render real results on the server and use link-based pagination. Filtered URLs are `noindex` with a clean canonical. Personal pages (cart, checkout, orders, wishlist, admin) are `noindex` and blocked in `robots.txt`.
- **Sitemap and markup:** the sitemap includes images. Each page has a single `h1` and semantic landmarks.

### Design principles
- **Business logic lives in `services/` folders.** These are pure functions with no React and no storage, and they are covered by 47 unit tests.
- **Money is calculated in one place.** `calculateTotals()` drives the cart, checkout and order creation, and `placeOrder()` recalculates totals instead of trusting numbers from the UI.
- **No hydration mismatches.** Persisted stores rehydrate after mount, and views that depend only on device data use `ClientGate`.
- **Persistence is versioned and safe.** Keys are namespaced as `luxe:v1:*`, storage failures are caught without crashing the app, and the simulated order history is capped.
- **Security and accessibility:** security headers are set, JSON-LD output is escaped, focus is managed in dialogs and menus, and live regions announce live content.

## Data and limitations
- The catalog seed was generated once from the public [DummyJSON](https://dummyjson.com) dataset and is stored in `src/data/`. The app never calls that API at runtime. Product images load from `cdn.dummyjson.com`. Building the OG images fetches those images, so the build needs network access; if it fails, the cards fall back to text only.
- All data is stored in each browser's `localStorage`, so data is per device. There is no authentication, and the admin area is open. A real launch needs a backend, authentication and a payment provider. The service layer is designed so these can replace the current pieces without rewriting the UI.
- Payments are simulated. No card details are ever collected.
