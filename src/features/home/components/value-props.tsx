"use client";

import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const PROPS = [
  { icon: Truck, title: "Free express shipping", body: "On every order over $100, delivered in 2–3 days." },
  { icon: RotateCcw, title: "30-day returns", body: "Changed your mind? Return it free, no questions asked." },
  { icon: ShieldCheck, title: "Secure payments", body: "256-bit encryption and fraud protection on every order." },
  { icon: Headphones, title: "24/7 concierge", body: "Real humans, ready to help whenever you need us." },
];

export function ValueProps() {
  return (
    <section className="py-12" aria-label="Why shop with us">
      <Container>
        <Stagger as="ul" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROPS.map(({ icon: Icon, title, body }) => (
            <StaggerItem as="li" key={title}>
              <div className="group h-full rounded-3xl border border-border bg-card p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
