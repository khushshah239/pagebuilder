import type { ArticleFooterProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/ArticleFooter.module.css";

/** Article footer: publisher logo, name and copyright line. */
export function ArticleFooter({
  identifier,
  publisher_name,
  copyright_text,
  logo,
}: ArticleFooterProps) {
  return (
    <footer className={styles.footer} data-organism={identifier}>
      <div className={styles.brand}>
        {logo ? (
          <img className={styles.logo} src={logo} alt={publisher_name} />
        ) : null}
        {publisher_name ? (
          <span className={styles.publisher}>{publisher_name}</span>
        ) : null}
      </div>
      {copyright_text ? (
        <small className={styles.copyright}>{copyright_text}</small>
      ) : null}
    </footer>
  );
}

export default ArticleFooter;
