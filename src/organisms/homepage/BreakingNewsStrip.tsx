import type { BreakingNewsStripProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/BreakingNewsStrip.module.css";

/** Scrolling ticker of urgent headlines, prefixed with a labelled badge. */
export function BreakingNewsStrip({
  identifier,
  label,
  headlines,
}: BreakingNewsStripProps) {
  if (headlines.length === 0) return null;

  return (
    <section
      className={styles.strip}
      data-organism={identifier}
      aria-label={label}
    >
      <span className={styles.badge}>{label}</span>
      <ul className={styles.ticker}>
        {headlines.map((headline, index) => (
          <li key={`${identifier}-headline-${index}`} className={styles.item}>
            {headline.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default BreakingNewsStrip;
