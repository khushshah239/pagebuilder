import { CardLink } from "../../components/CardLink";
import type { VideoBriefingsRailProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/VideoBriefingsRail.module.css";

/** Horizontally scrolling rail of video thumbnails with duration badges. */
export function VideoBriefingsRail({
  identifier,
  heading,
  videos,
}: VideoBriefingsRailProps) {
  if (videos.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label={heading ?? "Video briefings"}
    >
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      <div className={styles.rail}>
        {videos.map((video, index) => (
          <CardLink
            key={`${identifier}-video-${index}`}
            href={video.url_slug}
            className={styles.card}
          >
            <div className={styles.thumbWrap}>
              <img
                className={styles.thumbnail}
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
              />
              {video.duration_label ? (
                <span className={styles.duration}>{video.duration_label}</span>
              ) : null}
            </div>
            <h3 className={styles.title}>{video.title}</h3>
          </CardLink>
        ))}
      </div>
    </section>
  );
}

export default VideoBriefingsRail;
