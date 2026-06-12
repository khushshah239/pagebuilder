import Link from "next/link";
import type { TopStoriesListProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/TopStoriesList.module.css";

/** Ranked list of top stories, numbered and text-only (no images). */
export function TopStoriesList({
  identifier,
  heading,
  stories,
}: TopStoriesListProps) {
  if (stories.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label={heading ?? "Top stories"}
    >
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      <ol className={styles.list}>
        {stories.map((story, index) => (
          <li key={`${identifier}-story-${index}`} className={styles.item}>
            <span className={styles.rank}>{index + 1}</span>
            {story.url_slug ? (
              <Link
                href={story.url_slug}
                className={styles.title}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {story.title}
              </Link>
            ) : (
              <span className={styles.title}>{story.title}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default TopStoriesList;
