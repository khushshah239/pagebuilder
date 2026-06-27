"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "@/styles/components/ScrollRail.module.css";

/**
 * Wraps a horizontal scroll track and overlays prev/next slide arrows at the
 * vertical middle of the card edges. The prev arrow is hidden at the start and
 * the next arrow at the end, so each only appears where there's room to scroll.
 *
 * Cards are passed as `children` and rendered inside the scrolling track;
 * `trackClassName` supplies the organism's own flex / gap / card-width styles,
 * so the rail stays a thin client wrapper around otherwise server-rendered cards.
 */
export function ScrollRail({
  trackClassName,
  children,
}: {
  trackClassName?: string;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
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
  }, [updateArrows]);

  function scrollByDir(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div className={styles.viewport}>
      <div className={trackClassName} ref={trackRef}>
        {children}
      </div>
      {canPrev ? (
        <button type="button" className={`${styles.navBtn} ${styles.navPrev}`} aria-label="Previous" onClick={() => scrollByDir(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      ) : null}
      {canNext ? (
        <button type="button" className={`${styles.navBtn} ${styles.navNext}`} aria-label="Next" onClick={() => scrollByDir(1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
