import type { TagsRowProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/TagsRow.module.css";

/** Clickable topic/tag chips for the article. */
export function TagsRow({ identifier, tags }: TagsRowProps) {
  if (tags.length === 0) return null;

  return (
    <nav className={styles.row} data-organism={identifier} aria-label="Tags">
      <ul className={styles.tags}>
        {tags.map((tag, index) => (
          <li key={`${identifier}-tag-${index}`} className={styles.tag}>
            {tag.title}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TagsRow;
