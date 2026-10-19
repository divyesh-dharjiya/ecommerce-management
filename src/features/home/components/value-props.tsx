"use client";

import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui";

const PROPS = [
  { icon: Truck, title: "Free delivery", body: "On every order over $100, in 2–3 days." },
  { icon: RotateCcw, title: "30-day returns", body: "Free returns, no questions asked." },
  { icon: ShieldCheck, title: "Secure checkout", body: "Encrypted payments on every order." },
  { icon: Headphones, title: "Real support", body: "Humans ready to help, 24/7." },
];

export function ValueProps() {
  return (
    <section className="border-t border-border py-12" aria-label="Why shop with us">
      <Container>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {PROPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-4">
              <Icon className="mt-0.5 size-6 shrink-0" strokeWidth={1.75} />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
