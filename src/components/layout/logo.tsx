import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2", className)} aria-label={`${siteConfig.fullName} home`}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary via-fuchsia-500 to-accent text-white shadow-lg shadow-primary/30 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 4v13a3 3 0 0 0 3 3h9" />
          <path d="M11 9l3 3 4-5" />
        </svg>
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">
        {siteConfig.name}
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
