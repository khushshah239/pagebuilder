"use client";

/**
 * Global error boundary — the last-resort handler for errors thrown in the root
 * layout itself. It must render its own <html>/<body> because it replaces the
 * root layout when it activates.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28 }}>Something went wrong</h1>
        <p>An unexpected error occurred while loading the page.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#c8102e",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
