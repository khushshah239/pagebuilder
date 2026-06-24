import type { ArticleSummaryProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ArticleSummary.module.scss";

/** Key points / takeaways box rendered above the article body. */
export function ArticleSummary({
  identifier,
  heading,
  key_points,
}: ArticleSummaryProps) {
  if (key_points.length === 0) return null;

  return (
    <aside className={styles.summary} data-organism={identifier}>
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      <ul className={styles.list}>
        {key_points.map((point, index) => (
          <li key={`${identifier}-point-${index}`} className={styles.item}>
            {point.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
