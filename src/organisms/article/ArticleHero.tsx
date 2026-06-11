import type { ArticleHeroProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/ArticleHero.module.css";

/** Full-width article cover image with an optional excerpt below it. */
export function ArticleHero({ identifier, cover_image, excerpt }: ArticleHeroProps) {
  if (!cover_image && !excerpt) return null;

  return (
    <section
      className={styles.hero}
      data-organism={identifier}
      aria-label="Article cover"
    >
      {cover_image ? (
        <img
          className={styles.image}
          src={cover_image}
          alt={excerpt || "Article cover"}
        />
      ) : null}
      {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
    </section>
  );
}

export default ArticleHero;
