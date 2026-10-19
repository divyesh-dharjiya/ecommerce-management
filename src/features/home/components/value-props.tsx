"use client";

import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const PROPS = [
  { icon: Truck, title: "Free express shipping", body: "On every order over $100, delivered in 2–3 days." },
  { icon: RotateCcw, title: "30-day returns", body: "Changed your mind? Return it free, no questions asked." },
  { icon: ShieldCheck, title: "Secure payments", body: "Encrypted checkout and fraud protection on every order." },
  { icon: Headphones, title: "Human support", body: "Real people, ready to help whenever you need us." },
];

export function ValueProps() {
  return (
    <section className="py-16" aria-label="Why shop with us">
      <Container>
        <Stagger
          as="ul"
          className="grid grid-cols-1 border-y border-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border"
        >
          {PROPS.map(({ icon: Icon, title, body }) => (
            <StaggerItem as="li" key={title} className="p-7 first:pl-0 lg:p-8 lg:first:pl-0">
              <Icon className="size-6 text-accent" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
