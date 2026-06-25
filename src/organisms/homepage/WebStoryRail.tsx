import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import type { WebStoryRailProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/WebStoryRail.module.scss";

/** Small "web story" badge with a camera icon, shown on each portrait card. */
function StoryBadge() {
  return (
    <span className={styles.badge}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="6" width="14" height="12" rx="2" />
        <path d="M16 10l6-3v10l-6-3" />
      </svg>
      web story
    </span>
  );
}

/** Horizontal rail of full-bleed portrait (9:16) web-story cards. */
export function WebStoryRail({ identifier, heading, stories }: WebStoryRailProps) {
  if (stories.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={styles.track}>
        {stories.map((story, index) => {
          const body = (
            <>
              {story.thumbnail ? (
                <img
                  className={styles.image}
                  {...cdnImageSrcSet(story.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                  alt={story.title}
                  loading="lazy"
                />
              ) : null}
              <StoryBadge />
            </>
          );
          const key = `${identifier}-story-${index}`;
          return story.url_slug ? (
            <Link key={key} href={story.url_slug} className={styles.card}>
              {body}
            </Link>
          ) : (
            <div key={key} className={styles.card}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}
