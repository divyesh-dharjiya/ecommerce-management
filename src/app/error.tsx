"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Hook point for an error tracker (Sentry, Datadog, …).
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          An unexpected error occurred. Your cart and data are safe — try again.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>}
        <Button className="mt-8" onClick={reset}>
          <RotateCcw className="size-4" /> Try again
        </Button>
      </div>
    </main>
  );
}
