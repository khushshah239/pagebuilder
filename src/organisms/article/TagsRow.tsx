import Link from "next/link";
import { toInternalPath } from "@/lib/url";
import type { TagsRowProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/TagsRow.module.css";

/** Tag chip row shown below the article body. */
export function TagsRow({ identifier, heading, article_tags }: TagsRowProps) {
  if (article_tags.length === 0) return null;

  return (
    <div className={styles.tags} data-organism={identifier}>
      {heading ? <span className={styles.heading}>{heading}</span> : null}
      <div className={styles.track}>
        {article_tags.map((tag, index) => {
          const key = `${identifier}-tag-${index}`;
          return tag.url_slug ? (
            <Link key={key} href={toInternalPath(tag.url_slug)} className={styles.chip}>
              {tag.title}
            </Link>
          ) : (
            <span key={key} className={styles.chip}>
              {tag.title}
            </span>
          );
        })}
      </div>
    </div>
  );
}
