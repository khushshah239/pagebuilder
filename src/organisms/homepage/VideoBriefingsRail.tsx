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

  const [hero, ...rest] = videos;
  const heroHref = hero.url_slug ?? hero.url;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>
            {/* video camera icon */}
            <svg className={styles.headIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            {heading}
          </h2>
          <div className={styles.headMeta} />
        </header>
      ) : null}

      {/* ── Featured hero card ── */}
      <div className={styles.featured}>
        {heroHref ? <Link href={heroHref} className={styles.featuredLink} aria-label={hero.title} /> : null}
        {hero.thumbnail ? (
          <PbImage
            className={styles.featuredThumb}
            src={hero.thumbnail}
            alt={hero.title}
            fillParent
            priority
            sizes="(max-width: 900px) 100vw, 400px"
          />
        ) : null}
        <div className={styles.featuredOverlay} />
        <span className={styles.featuredPlay} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        {hero.duration_label ? (
          <span className={styles.featuredDuration}>{hero.duration_label}</span>
        ) : null}
        <div className={styles.featuredContent}>
          {hero.category_label ? (
            <CategoryLink
              label={hero.category_label}
              url={hero.category_url}
              className={styles.featuredCategory}
            />
          ) : null}
          <h3 className={styles.featuredTitle}>{hero.title}</h3>
          <div className={styles.featuredMeta}>
            <ArticleByline
              authorName={hero.author_name}
              authorUrl={hero.author_url}
              publishedAt={hero.published_at}
            />
          </div>
        </div>
      </div>

      {/* ── Compact list ── */}
      {rest.length > 0 ? (
        <>
          <div className={styles.divider}>
            <span className={styles.dividerLabel}>More Videos</span>
          </div>
          <div className={styles.track}>
            {rest.map((video, index) => {
              const key = `${identifier}-video-${index + 1}`;
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
                        sizes="(max-width: 600px) 35vw, 110px"
                      />
                    ) : null}
                    <span className={styles.play} aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
                    <span className={styles.index}>{index + 2}</span>
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
        </>
      ) : null}

    </section>
  );
}
