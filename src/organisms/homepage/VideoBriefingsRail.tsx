import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { VideoBriefingsRailProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/VideoBriefingsRail.module.scss";

/** Short-video / explainer reel rail with play badge and duration. */
export function VideoBriefingsRail({
  identifier,
  heading,
  videos,
}: VideoBriefingsRailProps) {
  if (videos.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={styles.track}>
        {videos.map((video, index) => {
          const key = `${identifier}-video-${index}`;
          const href = video.url_slug ?? video.url;
          return (
            <article key={key} className={styles.card}>
              {href ? (
                <Link
                  href={href}
                  className={styles.cardLink}
                  aria-label={video.title}
                />
              ) : null}
              <span className={styles.media}>
                {video.thumbnail ? (
                  <img
                    className={styles.thumb}
                    {...cdnImageSrcSet(video.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                    alt={video.title}
                    loading="lazy"
                  />
                ) : null}
                <span className={styles.play} aria-hidden="true">▶</span>
                {video.duration_label ? (
                  <span className={styles.duration}>{video.duration_label}</span>
                ) : null}
              </span>
              <div className={styles.text}>
                <CategoryLink
                  label={video.category_label}
                  url={video.category_url}
                  className={styles.category}
                />
                <h3 className={styles.title}>{video.title}</h3>
                <span className={styles.byline}>
                  <ArticleByline
                    authorName={video.author_name}
                    authorUrl={video.author_url}
                    publishedAt={video.published_at}
                  />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
