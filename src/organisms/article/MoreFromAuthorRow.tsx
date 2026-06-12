import { CardLink } from "../../components/CardLink";
import type { MoreFromAuthorRowProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/MoreFromAuthorRow.module.css";

/** "More from the author" — other articles by the same author. */
export function MoreFromAuthorRow({
  identifier,
  heading,
  articles,
}: MoreFromAuthorRowProps) {
  if (articles.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label={heading ?? "More from the author"}
    >
      <h2 className={styles.heading}>{heading ?? "More from the Author"}</h2>
      <div className={styles.grid}>
        {articles.map((article, index) => (
          <CardLink
            key={`${identifier}-article-${index}`}
            href={article.url_slug}
            className={styles.card}
          >
            <img
              className={styles.thumbnail}
              src={article.thumbnail}
              alt={article.title}
              loading="lazy"
            />
            <div className={styles.body}>
              <h3 className={styles.title}>{article.title}</h3>
              {article.published_at ? (
                <time className={styles.date}>{article.published_at}</time>
              ) : null}
            </div>
          </CardLink>
        ))}
      </div>
    </section>
  );
}

export default MoreFromAuthorRow;
