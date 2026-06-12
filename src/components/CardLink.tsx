import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Renders a card as a link to its article when `href` (a card's `url_slug`) is
 * present, otherwise as a plain block. Shared by every clickable card organism
 * so the click-through behaviour stays consistent.
 */
export function CardLink({
  href,
  className,
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  if (!href) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link
      href={href}
      className={className}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}
