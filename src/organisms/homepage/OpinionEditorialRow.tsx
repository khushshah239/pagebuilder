"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cdnImageSrcSet } from "@/lib/media";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { OpinionEditorialRowProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/OpinionEditorialRow.module.css";

/** Opinion / editorial rail — "View All" advances to the next pieces. */
export function OpinionEditorialRow({
  identifier,
  heading,
  items,
}: OpinionEditorialRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Prev hidden at the start; next hidden at the end — arrows only show where
  // there's actually room to scroll.
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      track.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, items.length]);

  if (items.length === 0) return null;

  /** Scroll the rail by roughly one card width in the given direction. */
  function scrollByDir(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={styles.viewport}>
        <div className={styles.grid} ref={trackRef}>
        {items.map((item, index) => {
          const key = `${identifier}-item-${index}`;
          // Stretched overlay link → article; category link above → section.
          return (
            <article key={key} className={styles.card}>
              {item.url_slug ? (
                <Link
                  href={item.url_slug}
                  className={styles.cardLink}
                  aria-label={item.title}
                />
              ) : null}
              {item.thumbnail ? (
                <img
                  className={styles.thumb}
                  {...cdnImageSrcSet(item.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                  alt={item.title}
                  loading="lazy"
                />
              ) : null}
              <div className={styles.text}>
                <CategoryLink
                  label={item.category_label}
                  url={item.category_url}
                  className={styles.category}
                />
                <h3 className={styles.title}>{item.title}</h3>
                {item.excerpt ? (
                  <p className={styles.excerpt}>{item.excerpt}</p>
                ) : null}
                <div className={styles.meta}>
                  <ArticleByline
                    authorName={item.author_name}
                    authorUrl={item.author_url}
                    publishedAt={item.published_at}
                  />
                </div>
              </div>
            </article>
          );
        })}
        </div>
        {canPrev ? (
          <button type="button" className={`${styles.navBtn} ${styles.navPrev}`} aria-label="Previous stories" onClick={() => scrollByDir(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : null}
        {canNext ? (
          <button type="button" className={`${styles.navBtn} ${styles.navNext}`} aria-label="Next stories" onClick={() => scrollByDir(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : null}
      </div>
    </section>
  );
}
