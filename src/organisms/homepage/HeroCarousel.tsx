"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import { CategoryLink } from "@/components/CategoryLink";
import type { HeroCarouselProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/HeroCarousel.module.css";

export function HeroCarousel({ identifier, slides }: HeroCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isPaused = useRef(false);

  if (slides.length === 0) return null;

  const goToSlide = useCallback((index: number) => {
    const track = trackRef.current;
    const child = track?.children[index] as HTMLElement | undefined;
    if (!track || !child) return;
    // Scroll only the track, never the page
    track.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  }, []);

  const rafRef = useRef<number>(0);

  // Coverflow 3D: each slide rotates based on how far it is from the viewport center.
  // Uses rAF so we never block the scroll thread.
  function apply3D() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const viewCenter = track.scrollLeft + track.offsetWidth / 2;
      (Array.from(track.children) as HTMLElement[]).forEach((el) => {
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        // offset: 0 = active slide, ±1 = one slide away
        const offset = (elCenter - viewCenter) / track.offsetWidth;
        const rotateY   = offset * 18;                          // gentle curve
        const scale     = 1 - Math.abs(offset) * 0.08;
        const translateZ = -Math.abs(offset) * 60;
        el.style.transform = `perspective(1400px) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`;
        el.style.opacity   = String(Math.max(0.55, 1 - Math.abs(offset) * 0.4));
        el.style.zIndex    = String(10 - Math.round(Math.abs(offset) * 10));
      });
    });
  }

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      if (!isPaused.current) {
        setActiveIndex((prev) => {
          const next = (prev + 1) % slides.length;
          goToSlide(next);
          return next;
        });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, goToSlide]);

  // Run 3D on mount so initial state is correct
  useEffect(() => { apply3D(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    apply3D();
    const children = Array.from(track.children) as HTMLElement[];
    let nearest = 0;
    let smallest = Infinity;
    children.forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - track.scrollLeft);
      if (distance < smallest) { smallest = distance; nearest = index; }
    });
    setActiveIndex(nearest);
  }

  return (
    <section
      className={styles.carousel}
      data-organism={identifier}
      aria-label="Featured stories"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
        {slides.map((slide, index) => (
          <article key={`${identifier}-slide-${index}`} className={styles.slide}>
            {slide.url_slug ? (
              <Link href={slide.url_slug} className={styles.slideLink} aria-label={slide.title} />
            ) : null}
            {slide.image ? (
              <PbImage
                className={styles.image}
                src={slide.image}
                alt={slide.title}
                fillParent
                priority={index === 0}
                sizes="100vw"
              />
            ) : null}
            <div className={styles.overlay}>
              <CategoryLink label={slide.category_label} url={slide.category_url} className={styles.category} />
              <h2 className={styles.title}>{slide.title}</h2>
              {slide.excerpt ? <p className={styles.excerpt}>{slide.excerpt}</p> : null}
              {slide.url_slug ? (
                <Link href={slide.url_slug} className={styles.readMore} prefetch={false}>
                  Read More
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {slides.length > 1 ? (
        <div className={styles.dots} aria-label="Carousel pagination">
          {slides.map((_slide, index) => (
            <button
              key={`${identifier}-dot-${index}`}
              type="button"
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
