import type { ArticleFooterProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ArticleFooter.module.css";

/** Article footer with publisher info and copyright. */
export function ArticleFooter({
  identifier,
  publisher_name,
  logo,
  copyright_text,
}: ArticleFooterProps) {
  if (!publisher_name && !logo && !copyright_text) return null;

  return (
    <footer className={styles.footer} data-organism={identifier}>
      {logo ? <img className={styles.logo} src={logo} alt={publisher_name || ""} /> : null}
      {publisher_name ? (
        <span className={styles.publisher}>{publisher_name}</span>
      ) : null}
      {copyright_text ? (
        <span className={styles.copyright}>{copyright_text}</span>
      ) : null}
    </footer>
  );
}
