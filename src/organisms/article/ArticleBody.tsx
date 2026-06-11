import type { ArticleBodyProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/ArticleBody.module.css";

/**
 * Rich-text article body. The HTML originates from the trusted CMS, so it is
 * injected via `dangerouslySetInnerHTML` (sanitize upstream if that ever changes).
 */
export function ArticleBody({ identifier, body }: ArticleBodyProps) {
  if (!body) return null;

  return (
    <article
      className={styles.body}
      data-organism={identifier}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

export default ArticleBody;
