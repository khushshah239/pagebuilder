import Link from "next/link";
import { toInternalPath } from "@/lib/url";

/**
 * A byline's author name. When the binding supplies an author URL (the
 * contributor's `absolute_url`) it renders as a link to that author page (path
 * derived from the CDS URL); otherwise it's plain text. Renders nothing without
 * a name.
 *
 * Meant to sit inside a card's byline above the card's stretched article link,
 * so the caller's `className` must give it its own stacking context (position +
 * z-index) — mirroring how `CategoryLink` sits above the same overlay.
 */
export function AuthorLink({
  name,
  url,
  className,
}: {
  name?: string;
  url?: string;
  className?: string;
}) {
  if (!name) return null;

  const href = toInternalPath(url);
  return href ? (
    <Link href={href} className={className}>
      {name}
    </Link>
  ) : (
    <span className={className}>{name}</span>
  );
}
