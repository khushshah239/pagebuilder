"use client";

import { useRef } from "react";
import Link from "next/link";
import { cdnImageSrcSet } from "@/lib/media";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { SectionRowProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/SectionRow.module.css";

/** Category-specific article rail — "View All" advances to the next cards. */
export function SectionRow({ identifier, heading, cards }: SectionRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (cards.length === 0) return null;

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
      <header className={styles.head}>
        {heading ? <h2 className={styles.heading}>{heading}</h2> : <span />}
        <div className={styles.nav}>
          <button type="button" className={styles.navBtn} aria-label="Previous stories" onClick={() => scrollByDir(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" className={styles.navBtn} aria-label="Next stories" onClick={() => scrollByDir(1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </header>
      <div className={styles.track} ref={trackRef}>
        {cards.map((card, index) => {
          const key = `${identifier}-card-${index}`;
          // Stretched overlay link → article; category link above → section.
          return (
            <article key={key} className={styles.card}>
              {card.url_slug ? (
                <Link
                  href={card.url_slug}
                  className={styles.cardLink}
                  aria-label={card.title}
                />
              ) : null}
              {card.thumbnail ? (
                <img
                  className={styles.thumb}
                  {...cdnImageSrcSet(card.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                  alt={card.title}
                  loading="lazy"
                />
              ) : null}
              <div className={styles.text}>
                <CategoryLink
                  label={card.category_label}
                  url={card.category_url}
                  className={styles.category}
                />
                <h3 className={styles.title}>{card.title}</h3>
                <div className={styles.meta}>
                  <ArticleByline
                    authorName={card.author_name}
                    authorUrl={card.author_url}
                    publishedAt={card.published_at}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
