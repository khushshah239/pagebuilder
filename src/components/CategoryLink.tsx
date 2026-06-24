import Link from "next/link";
import { toInternalPath } from "@/lib/url";

/**
 * A card's category label. When the binding supplies a category URL it renders
 * as a link to that section page (path derived from the CDS `absolute_url`);
 * otherwise it's plain text. Renders nothing without a label.
 *
 * Meant to sit above a card's stretched article link, so the caller's
 * `className` must give it its own stacking context (position + z-index).
 */
export function CategoryLink({
  label,
  url,
  className,
}: {
  label?: string;
  url?: string;
  className?: string;
}) {
  if (!label) return null;

  const href = toInternalPath(url);
  return href ? (
    <Link href={href} className={className}>
      {label}
    </Link>
  ) : (
    <span className={className}>{label}</span>
  );
}
