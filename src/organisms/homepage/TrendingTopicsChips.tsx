import type { TrendingTopicsChipsProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/TrendingTopicsChips.module.css";

/** Row of clickable "trending now" topic chips. */
export function TrendingTopicsChips({
  identifier,
  chips,
}: TrendingTopicsChipsProps) {
  if (chips.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label="Trending topics"
    >
      <ul className={styles.chips}>
        {chips.map((chip, index) => (
          <li key={`${identifier}-chip-${index}`} className={styles.chip}>
            {chip.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TrendingTopicsChips;
