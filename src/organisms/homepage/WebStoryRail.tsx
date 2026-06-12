import { CardLink } from "../../components/CardLink";
import type { WebStoryRailProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/WebStoryRail.module.css";

/** Horizontally scrolling rail of circular web-story bubbles. */
export function WebStoryRail({ identifier, stories }: WebStoryRailProps) {
  if (stories.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label="Web stories"
    >
      <div className={styles.rail}>
        {stories.map((story, index) => (
          <CardLink
            key={`${identifier}-story-${index}`}
            href={story.url_slug}
            className={styles.bubble}
          >
            <img
              className={styles.thumbnail}
              src={story.thumbnail}
              alt={story.title}
              loading="lazy"
            />
            <span className={styles.title}>{story.title}</span>
          </CardLink>
        ))}
      </div>
    </section>
  );
}

export default WebStoryRail;
