import { siteConfig } from "@/config/site";

const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
});

const compactFormatter = new Intl.NumberFormat(siteConfig.locale, {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatPrice = (value: number) => currencyFormatter.format(value);
export const formatCompact = (value: number) => compactFormatter.format(value);
export const formatNumber = (value: number) => value.toLocaleString(siteConfig.locale);

export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
) {
  return new Intl.DateTimeFormat(siteConfig.locale, opts).format(new Date(iso));
}

export function formatRelativeTime(iso: string, now = Date.now()) {
  const diff = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(siteConfig.locale, { numeric: "auto" });
  const abs = Math.abs(diff);
  // Clocks tick on intervals, so very recent events can appear slightly in the future.
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;
