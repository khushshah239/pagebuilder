import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { ArticleHeaderProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ArticleHeader.module.css";

/** Article title, category tag and byline at the top of the article. */
export function ArticleHeader({
  identifier,
  title,
  category_label,
  category_url,
  author_name,
  author_url,
  published_at,
}: ArticleHeaderProps) {
  if (!title) return null;

  return (
    <header className={styles.header} data-organism={identifier}>
      <CategoryLink
        label={category_label}
        url={category_url}
        className={styles.category}
      />
      <h1 className={styles.title}>{title}</h1>
      <ArticleByline
        authorName={author_name}
        authorUrl={author_url}
        publishedAt={published_at}
      />
    </header>
  );
}
