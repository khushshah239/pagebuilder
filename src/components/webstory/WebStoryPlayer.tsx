"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WebStoryPlayerProps } from "@/types/webstory/organism.types";
import styles from "@/styles/webstory/WebStoryPlayer.module.scss";

const SLIDE_DURATION_MS = 5000;

const CloseIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" aria-hidden="true">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

/**
 * Web Story player: reads slides directly from the post's content_json —
 * no template, no binding. Click a story link → this renders.
 */
export function WebStoryPlayer({ slides, animation, publisherName }: WebStoryPlayerProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const lastIndex = slides.length - 1;

  useEffect(() => {
    for (const item of slides) {
      if (item.img) {
        const img = new window.Image();
        img.src = item.img;
      }
    }
  }, [slides]);

  useEffect(() => {
    if (current >= lastIndex) return;
    const timer = setTimeout(
      () => setCurrent((i) => Math.min(i + 1, lastIndex)),
      SLIDE_DURATION_MS
    );
    return () => clearTimeout(timer);
  }, [current, lastIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setCurrent((i) => Math.min(i + 1, lastIndex));
      else if (e.key === "ArrowLeft") setCurrent((i) => Math.max(i - 1, 0));
      else if (e.key === "Escape") router.back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastIndex, router]);

  if (slides.length === 0) return null;

  const slide = slides[Math.min(current, lastIndex)];
  const goPrev = () => setCurrent((i) => Math.max(i - 1, 0));
  const goNext = () => setCurrent((i) => Math.min(i + 1, lastIndex));

  return (
    <div className={styles.stage}>
      {slide.img ? (
        <div className={styles.backdrop} style={{ backgroundImage: `url(${slide.img})` }} aria-hidden="true" />
      ) : null}
      <div className={styles.backdropTint} aria-hidden="true" />

      <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={goPrev} disabled={current === 0} aria-label="Previous slide">‹</button>

      <div className={styles.container}>
        <div key={current} className={styles.slide}
          data-animation={animation || undefined}
          style={slide.img ? { backgroundImage: `url(${slide.img})` } : undefined}>

          <div className={styles.progress} aria-hidden="true">
            {slides.map((_, index) => (
              <span key={index} className={styles.track}>
                <span className={`${styles.fill} ${index < current ? styles.fillDone : ""} ${index === current ? styles.fillActive : ""}`}
                  style={index === current ? { animationDuration: `${SLIDE_DURATION_MS}ms` } : undefined} />
              </span>
            ))}
          </div>

          <div className={styles.topBar}>
            {publisherName ? <span className={styles.logo}>{publisherName}</span> : <span />}
            <div className={styles.actions}>
              <button type="button" className={styles.iconBtn}
                onClick={() => router.back()} aria-label="Close">
                {CloseIcon}
              </button>
            </div>
          </div>

          <button type="button" className={`${styles.tap} ${styles.tapPrev}`} onClick={goPrev} tabIndex={-1} aria-label="Previous slide" />
          <button type="button" className={`${styles.tap} ${styles.tapNext}`} onClick={goNext} tabIndex={-1} aria-label="Next slide" />

          {slide.title || slide.description || slide.cta_text ? (
            <div className={styles.card}>
              {slide.title ? <h2 className={styles.title}>{slide.title}</h2> : null}
              {slide.description ? <p className={styles.description}>{slide.description}</p> : null}
              {slide.cta_text && slide.cta_link ? (
                <a className={styles.cta} href={slide.cta_link} target="_blank" rel="noopener noreferrer">
                  {slide.cta_text}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <button type="button" className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={goNext} disabled={current === lastIndex} aria-label="Next slide">›</button>
    </div>
  );
}
