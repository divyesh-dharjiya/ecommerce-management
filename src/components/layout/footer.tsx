import Link from "next/link";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { FOOTER_NAV } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { Newsletter } from "@/components/layout/newsletter";

const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "UPI", "PayPal"];

const PROMISES = [
  { icon: Truck, title: "Free delivery", body: "On orders over $100" },
  { icon: RotateCcw, title: "Easy returns", body: "30 days, free of charge" },
  { icon: ShieldCheck, title: "Secure payment", body: "Your data is protected" },
  { icon: Headphones, title: "Help when you need it", body: "Support every day" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-subtle print:hidden">
      <div className="border-b border-border">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{siteConfig.description}</p>
            <div>
              <p className="mb-2 text-sm font-semibold">Get deals in your inbox</p>
              <Newsletter />
            </div>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_NAV.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-semibold">{col.title}</h2>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-muted-foreground transition hover:text-primary">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payment methods">
            {PAYMENT_METHODS.map((p) => (
              <li key={p} className="rounded-md border border-border bg-card px-2 py-1 font-medium">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
