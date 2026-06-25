"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { widenCdnImage } from "@/lib/media";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { HeroCarouselProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/HeroCarousel.module.scss";

/**
 * Dominant visual zone at the top of the homepage — top stories presented as a
 * full-bleed, horizontally snapping carousel with pagination dots.
 */
export function HeroCarousel({ identifier, slides }: HeroCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (slides.length === 0) return null;

  /** Track which slide is centred as the user scrolls, to light the right dot. */
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

  /** Scroll the carousel to a given slide when its dot is clicked. */
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
          const imageSrc = widenCdnImage(slide.image, "1200x675");
          const imageSrcSet = `${widenCdnImage(slide.image, "768x432")} 768w, ${widenCdnImage(slide.image, "1200x675")} 1200w`;
          const key = `${identifier}-slide-${index}`;
          // The whole slide links to the article via a stretched overlay link;
          // the overlay is click-through (pointer-events: none) except the
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
              {/* Only render images when a URL resolved — an empty `src` makes
                  the browser re-request the current page. */}
              {imageSrc ? (
                <>
                  {/* Blurred fill behind the contained image so any aspect ratio
                      fills the hero without cropping or empty letterbox bars. */}
                  <img
                    className={styles.backdrop}
                    src={imageSrc}
                    srcSet={imageSrcSet}
                    sizes="100vw"
                    alt=""
                    aria-hidden="true"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <img
                    className={styles.image}
                    src={imageSrc}
                    srcSet={imageSrcSet}
                    sizes="100vw"
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </>
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
                <ArticleByline
                  authorName={slide.author_name}
                  authorUrl={slide.author_url}
                  publishedAt={slide.published_at}
                  readTime={slide.read_time}
                />
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
