import Link from "next/link";

/**
 * 404 boundary. Rendered when a route calls `notFound()` — e.g. an article
 * whose legacy URL doesn't resolve in CDS. Required by the App Router so
 * client-side navigations to a missing page have a boundary to show.
 */
export default function NotFound() {
  return (
    <main className="pb-page">
      <div className="pb-stack" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Page not found</h1>
        <p style={{ color: "var(--pb-muted, #6b7280)", margin: 0 }}>
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <Link href="/" style={{ color: "var(--pb-accent, #c8102e)", fontWeight: 700 }}>
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
