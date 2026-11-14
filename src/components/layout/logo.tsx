import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Wordmark: a rounded indigo bag mark beside the store name. */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight", className)}
      aria-label={`${siteConfig.fullName} home`}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden>
        <ShoppingBag className="size-[18px]" strokeWidth={2.25} />
      </span>
      <span>
        {siteConfig.name.charAt(0)}
        {siteConfig.name.slice(1).toLowerCase()}
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
