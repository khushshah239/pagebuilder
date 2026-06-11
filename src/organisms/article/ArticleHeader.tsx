import type { ArticleHeaderProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/ArticleHeader.module.css";

/** Article headline with its publish date. */
export function ArticleHeader({
  identifier,
  title,
  published_at,
}: ArticleHeaderProps) {
  return (
    <header className={styles.header} data-organism={identifier}>
      <h1 className={styles.title}>{title}</h1>
      {published_at ? <time className={styles.date}>{published_at}</time> : null}
    </header>
  );
}

export default ArticleHeader;
