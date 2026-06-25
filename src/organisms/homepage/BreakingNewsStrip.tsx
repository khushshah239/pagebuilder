import Link from "next/link";
import type { BreakingNewsStripProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/BreakingNewsStrip.module.scss";

/**
 * Scrolling ticker strip for urgent breaking headlines. The headlines are
 * rendered twice (one visible copy + one `aria-hidden` copy) so the CSS marquee
 * can loop seamlessly — it translates by exactly one copy's width, so the
 * second copy slides into the first's place with no gap or pause.
 */
export function BreakingNewsStrip({
  identifier,
  label,
  headlines,
}: BreakingNewsStripProps) {
  // Drop blank headlines so we never render a lone bullet with no text.
  const items = headlines.filter(
    (headline) => typeof headline.title === "string" && headline.title.trim() !== ""
  );
  if (items.length === 0) return null;

  const renderGroup = (duplicate: boolean) => (
    <div className={styles.group} aria-hidden={duplicate || undefined}>
      {items.map((headline, index) => {
        const key = `${identifier}-${duplicate ? "dup-" : ""}headline-${index}`;
        return headline.url_slug ? (
          <Link
            key={key}
            href={headline.url_slug}
            className={styles.item}
            tabIndex={duplicate ? -1 : undefined}
          >
            {headline.title}
          </Link>
        ) : (
          <span key={key} className={styles.item}>
            {headline.title}
          </span>
        );
      })}
    </div>
  );

  return (
    <section
      className={styles.strip}
      data-organism={identifier}
      aria-label="Breaking news"
    >
      {label ? <span className={styles.badge}>{label}</span> : null}
      <div className={styles.viewport}>
        <div className={styles.marquee}>
          {renderGroup(false)}
          {renderGroup(true)}
        </div>
      </div>
    </section>
  );
}
