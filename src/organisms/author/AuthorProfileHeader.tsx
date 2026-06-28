import { PbImage } from "@/components/PbImage";
import type { AuthorProfileHeaderProps } from "@/types/author/organism.types";
import styles from "@/styles/organisms/author/AuthorProfileHeader.module.css";

/**
 * AuthorPage header: circular avatar, the author's name, bio, and a divider
 * beneath — the author-page analogue of the section hero. Renders nothing
 * without a name.
 */
export function AuthorProfileHeader({
  identifier,
  author_name,
  avatar,
  bio,
}: AuthorProfileHeaderProps) {
  if (!author_name) return null;

  return (
    <header className={styles.header} data-organism={identifier}>
      <div className={styles.top}>
        {avatar ? (
          <PbImage
            className={styles.avatar}
            src={avatar}
            alt={author_name}
            fixed={{ width: 96, height: 96 }}
            placeholder="none"
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            {author_name.charAt(0)}
          </span>
        )}
        <div className={styles.identity}>
          <h1 className={styles.name}>{author_name}</h1>
          {bio ? <p className={styles.bio}>{bio}</p> : null}
        </div>
      </div>
    </header>
  );
}
