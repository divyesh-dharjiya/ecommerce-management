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
    toast.success("You're on the list!", { description: "Watch your inbox for exclusive drops." });
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
        placeholder="Your email for exclusive drops"
        className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 active:scale-95"
      >
        <Send className="size-4" />
      </button>
    </form>
  );
}
