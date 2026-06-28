"use client";

import { useRef } from "react";
import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import type { VideoBriefingsRailProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/VideoBriefingsRail.module.css";

/** Short-video / explainer reel rail with play badge, duration, and scroll arrows. */
export function VideoBriefingsRail({
  identifier,
  heading,
  videos,
}: VideoBriefingsRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (videos.length === 0) return null;

  /** Scroll the rail by roughly one card width in the given direction. */
  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <section className={styles.section} data-organism={identifier}>
      <header className={styles.head}>
        {heading ? <h2 className={styles.heading}>{heading}</h2> : <span />}
        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} aria-label="Previous videos" onClick={() => scrollBy(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" className={styles.navBtn} aria-label="Next videos" onClick={() => scrollBy(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </header>

      <div className={styles.track} ref={trackRef}>
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
                    sizes="(max-width: 600px) 45vw, 300px"
                  />
                ) : null}
                <span className={styles.play} aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {video.duration_label ? (
                  <span className={styles.duration}>{video.duration_label}</span>
                ) : null}
              </span>
              <h3 className={styles.title}>{video.title}</h3>
            </article>
          );
        })}
      </div>
    </section>
  );
}
