"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { storageKey } from "@/config/site";
import { isEmail } from "@/lib/validation";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      const key = storageKey("newsletter");
      const list = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
      if (!list.includes(email)) localStorage.setItem(key, JSON.stringify([...list, email]));
    } catch {
      /* non-critical */
    }
    toast.success("You're on the list!", { description: "We will email you our best deals." });
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="flex max-w-sm gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      <button
        type="submit"

        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        <Send className="size-4" /> Subscribe
      </button>
    </form>
  );
}
