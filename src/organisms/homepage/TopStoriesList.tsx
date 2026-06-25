import Link from "next/link";
import { ArticleByline } from "@/components/ArticleByline";
import type { TopStoriesListProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/TopStoriesList.module.css";

/** Ranked vertical list of top stories — numbered, no thumbnails. */
export function TopStoriesList({
  identifier,
  heading,
  stories,
}: TopStoriesListProps) {
  if (stories.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <ol className={styles.list}>
        {stories.map((story, index) => {
          const key = `${identifier}-story-${index}`;
          // Stretched overlay link → article; the author byline above it links
          // to the author page (its own stacking context, no nested anchors).
          return (
            <li key={key} className={styles.item}>
              {story.url_slug ? (
                <Link
                  href={story.url_slug}
                  className={styles.link}
                  aria-label={story.title}
                />
              ) : null}
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.body}>
                <span className={styles.title}>{story.title}</span>
                <ArticleByline
                  authorName={story.author_name}
                  authorUrl={story.author_url}
                  publishedAt={story.published_at}
                />
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
