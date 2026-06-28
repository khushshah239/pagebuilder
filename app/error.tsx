"use client";

/**
 * Route error boundary. Catches runtime errors thrown while rendering a route
 * (e.g. an unexpected CDS payload) and offers a retry. Required by the App
 * Router so a failed client-side navigation has a boundary instead of forcing a
 * full-page reload.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="pb-page">
      <div className="pb-stack" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
        <p style={{ color: "var(--pb-muted, #6b6a64)", margin: 0 }}>
          We couldn’t load this page. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            alignSelf: "center",
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "var(--pb-accent, #1f6f54)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
