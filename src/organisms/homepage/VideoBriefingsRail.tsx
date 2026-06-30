import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { VideoBriefingsRailProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/VideoBriefingsRail.module.css";

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
                <Link href={href} className={styles.cardLink} aria-label={video.title} />
              ) : null}
              <span className={styles.media}>
                {video.thumbnail ? (
                  <PbImage
                    className={styles.thumb}
                    src={video.thumbnail}
                    alt={video.title}
                    fillParent
                    sizes="(max-width: 600px) 45vw, 160px"
                  />
                ) : null}
                <span className={styles.play} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {video.duration_label ? (
                  <span className={styles.duration}>{video.duration_label}</span>
                ) : null}
                {video.category_label ? (
                  <CategoryLink
                    label={video.category_label}
                    url={video.category_url}
                    className={styles.category}
                  />
                ) : null}
              </span>
              <span className={styles.text}>
                <h3 className={styles.title}>{video.title}</h3>
                <ArticleByline
                  authorName={video.author_name}
                  authorUrl={video.author_url}
                  publishedAt={video.published_at}
                />
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
