"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import { CategoryLink } from "@/components/CategoryLink";
import type { HeroCarouselProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/HeroCarousel.module.css";

export function HeroCarousel({ identifier, slides }: HeroCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (slides.length === 0) return null;

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const children = Array.from(track.children) as HTMLElement[];
    let nearest = 0;
    let smallest = Infinity;
    children.forEach((child, index) => {
      const distance = Math.abs(child.offsetLeft - track.scrollLeft);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  }

  function goToSlide(index: number) {
    const child = trackRef.current?.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  return (
    <section
      className={styles.carousel}
      data-organism={identifier}
      aria-label="Featured stories"
    >
      <div className={styles.track} ref={trackRef} onScroll={handleScroll}>
        {slides.map((slide, index) => {
          const key = `${identifier}-slide-${index}`;
          // The overlay is click-through (pointer-events: none) except the
          // category, which links to its section page.
          return (
            <article key={key} className={styles.slide}>
              {slide.url_slug ? (
                <Link
                  href={slide.url_slug}
                  className={styles.slideLink}
                  aria-label={slide.title}
                />
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
                <CategoryLink
                  label={slide.category_label}
                  url={slide.category_url}
                  className={styles.category}
                />
                <h2 className={styles.title}>{slide.title}</h2>
                {slide.excerpt ? (
                  <p className={styles.excerpt}>{slide.excerpt}</p>
                ) : null}
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
          );
        })}
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
