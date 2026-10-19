import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Wordmark: heavy condensed "LUXE" with a red slash mark. */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-baseline font-display text-[2rem] leading-none", className)}
      aria-label={`${siteConfig.fullName} home`}
    >
      {siteConfig.name}
      <span className="ml-0.5 inline-block h-[0.55em] w-[0.18em] -skew-x-12 bg-accent" aria-hidden />
    </Link>
  );
}
