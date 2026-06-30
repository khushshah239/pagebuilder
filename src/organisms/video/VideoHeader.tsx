import { formatPublishedDateTime } from "@/lib/date";
import { PbImage } from "@/components/PbImage";
import { CategoryLink } from "@/components/CategoryLink";
import { AuthorLink } from "@/components/AuthorLink";
import type { VideoHeaderProps } from "@/types/video/organism.types";
import styles from "@/styles/organisms/video/VideoHeader.module.css";

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
            <PbImage
              className={styles.avatar}
              src={author_avatar}
              alt={author_name}
              fixed={{ width: 48, height: 48 }}
              placeholder="none"
            />
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
