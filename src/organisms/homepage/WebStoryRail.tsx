"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import type { WebStoryRailProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/WebStoryRail.module.css";

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

/** Chevron used by the scroll buttons. */
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

/** Horizontal rail of full-bleed portrait (9:16) web-story cards. */
export function WebStoryRail({ identifier, heading, stories }: WebStoryRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, stories.length]);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by ~one card width plus gap.
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (stories.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}

      <div className={styles.viewport}>
        <div className={styles.track} ref={trackRef}>
          {stories.map((story, index) => {
            const body = (
              <>
                {story.thumbnail ? (
                  <PbImage
                    className={styles.image}
                    src={story.thumbnail}
                    alt={story.title ?? ""}
                    fillParent
                    sizes="(max-width: 600px) 40vw, 220px"
                  />
                ) : null}
                <StoryBadge />
                {story.title ? (
                  <div className={styles.overlay}>
                    <h3 className={styles.title}>{story.title}</h3>
                  </div>
                ) : null}
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

        {canPrev ? (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={() => scroll("left")}
            aria-label="Scroll to previous web stories"
          >
            <Chevron dir="left" />
          </button>
        ) : null}
        {canNext ? (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={() => scroll("right")}
            aria-label="Scroll to more web stories"
          >
            <Chevron dir="right" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
