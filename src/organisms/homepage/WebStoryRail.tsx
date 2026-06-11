import type { WebStoryRailProps } from "../../types/organism.types";
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
          <article key={`${identifier}-story-${index}`} className={styles.bubble}>
            <img
              className={styles.thumbnail}
              src={story.thumbnail}
              alt={story.title}
              loading="lazy"
            />
            <span className={styles.title}>{story.title}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WebStoryRail;
