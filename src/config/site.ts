export const siteConfig = {
  name: "Luxe",
  fullName: "Luxe Commerce",
  tagline: "Curated goods, delivered beautifully.",
  description:
    "Luxe Commerce — shop 100+ curated products across beauty, tech, fashion and home with lightning-fast checkout.",
  currency: "USD",
  locale: "en-US",
  supportEmail: "support@luxe.example",
} as const;

export const commerceConfig = {
  freeShippingThreshold: 100,
  flatShippingRate: 9.99,
  taxRate: 0.08,
  maxQuantityPerItem: 10,
  lowStockThreshold: 10,
  defaultPageSize: 12,
} as const;

/** localStorage key namespace. Bump the version to invalidate every persisted store. */
export const STORAGE_PREFIX = "luxe:v1";
export const storageKey = (name: string) => `${STORAGE_PREFIX}:${name}`;

export const liveConfig = {
  minIntervalMs: 5_000,
  maxIntervalMs: 11_000,
  leaderHeartbeatMs: 2_000,
  leaderTimeoutMs: 6_000,
  maxEvents: 60,
  maxLiveOrders: 300,
} as const;
