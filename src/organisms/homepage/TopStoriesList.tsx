import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import type { TopStoriesListProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/TopStoriesList.module.css";

export function TopStoriesList({ identifier, heading, stories }: TopStoriesListProps) {
  if (stories.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>
            <svg className={styles.headIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            {heading}
          </h2>
        </header>
      ) : null}

      <ol className={styles.list}>
        {stories.map((story, index) => {
          const key = `${identifier}-story-${index}`;
          return (
            <li key={key} className={styles.item}>
              {story.url_slug ? (
                <Link href={story.url_slug} className={styles.link} aria-label={story.title} />
              ) : null}
              <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.body}>
                {story.category_label ? (
                  <CategoryLink
                    label={story.category_label}
                    url={story.category_url}
                    className={styles.category}
                  />
                ) : null}
                <span className={styles.title}>{story.title}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
