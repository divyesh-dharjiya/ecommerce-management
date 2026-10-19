import Link from "next/link";
import { buttonClasses } from "@/components/ui";

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[480px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="relative">
        <p className="font-display text-[9rem] italic leading-none text-accent">404</p>
        <h1 className="mt-4 font-display text-3xl">This page wandered off</h1>
        <p className="mt-3 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={buttonClasses("primary")}>
            Back home
          </Link>
          <Link href="/products" className={buttonClasses("outline")}>
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
