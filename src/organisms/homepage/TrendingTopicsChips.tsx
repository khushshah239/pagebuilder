import Link from "next/link";
import { toInternalPath } from "@/lib/url";
import type { TrendingTopicsChipsProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/TrendingTopicsChips.module.css";

export function TrendingTopicsChips({
  identifier,
  heading,
  chips,
}: TrendingTopicsChipsProps) {
  // A chip with no label can't be rendered meaningfully (e.g. a malformed
  // binding entry that resolves a url but no name) — drop it.
  const visibleChips = chips.filter((chip) => chip.label);
  if (visibleChips.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? <span className={styles.heading}>{heading}</span> : null}
      <div className={styles.track}>
        {visibleChips.map((chip, index) => {
          const key = `${identifier}-chip-${index}`;
          const explicit = chip.url_slug ?? chip.url ?? chip.legacy_url;
          // Derive tag URL from label if no explicit URL stored (e.g. "Top 10" → /tag/top-10)
          const href = explicit ?? `/tags/${chip.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
          return (
            <Link key={key} href={toInternalPath(href)} className={styles.chip}>
              #{chip.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
