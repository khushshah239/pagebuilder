import type { ArticleSummaryProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/ArticleSummary.module.css";

/** "Overview" box listing the article's key points. */
export function ArticleSummary({
  identifier,
  heading,
  key_points,
}: ArticleSummaryProps) {
  if (key_points.length === 0) return null;

  return (
    <aside
      className={styles.summary}
      data-organism={identifier}
      aria-label={heading ?? "Overview"}
    >
      <h2 className={styles.heading}>{heading ?? "Overview"}</h2>
      <ul className={styles.points}>
        {key_points.map((point, index) => (
          <li key={`${identifier}-point-${index}`} className={styles.point}>
            {point.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default ArticleSummary;
