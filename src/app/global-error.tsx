"use client";

/**
 * Last-resort boundary: renders when the root layout itself fails, so it
 * must supply its own <html>/<body> and cannot rely on app providers or
 * Tailwind component classes that depend on them.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#6b655c", maxWidth: 420, margin: "12px auto 24px" }}>
            An unexpected error stopped the page from loading. Your cart is saved on this device.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#8a8378" }}>Ref: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              height: 44,
              padding: "0 24px",
              border: 0,
              borderRadius: 6,
              background: "#0f172a",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
