import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Wordmark: serif "Luxe" with an accent full stop. */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("font-display text-[1.75rem] leading-none tracking-tight", className)}
      aria-label={`${siteConfig.fullName} home`}
    >
      {siteConfig.name}
      <span className="text-accent">.</span>
    </Link>
  );
}
