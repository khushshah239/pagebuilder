import { formatPublishedDateTime } from "@/lib/date";
import { CategoryLink } from "@/components/CategoryLink";
import { AuthorLink } from "@/components/AuthorLink";
import type { VideoHeaderProps } from "@/types/video/organism.types";
import styles from "@/styles/organisms/video/VideoHeader.module.css";

/**
 * Video page header: a category pill, large title, published date, and an author
 * row with a circular avatar and a linked name — the video-page equivalent of
 * ArticleHeader, extended with the author avatar that article pages don't show.
 */
export function VideoHeader({
  identifier,
  title,
  category_label,
  category_url,
  author_name,
  author_url,
  author_avatar,
  published_at,
}: VideoHeaderProps) {
  if (!title) return null;

  const dateTime = formatPublishedDateTime(published_at) || published_at || "";

  return (
    <header className={styles.header} data-organism={identifier}>
      <CategoryLink
        label={category_label}
        url={category_url}
        className={styles.category}
      />
      <h1 className={styles.title}>{title}</h1>
      {dateTime ? <p className={styles.date}>{dateTime}</p> : null}
      {author_name ? (
        <div className={styles.author}>
          {author_avatar ? (
            <img className={styles.avatar} src={author_avatar} alt={author_name} />
          ) : (
            <span className={styles.avatarFallback} aria-hidden="true">
              {author_name.charAt(0)}
            </span>
          )}
          <AuthorLink
            name={author_name}
            url={author_url}
            className={styles.authorName}
          />
        </div>
      ) : null}
    </header>
  );
}
