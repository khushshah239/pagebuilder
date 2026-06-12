import Link from "next/link";
import type { HeroCarouselProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/HeroCarousel.module.css";

/** Top featured stories, presented as a horizontally scrollable hero carousel. */
export function HeroCarousel({ identifier, slides }: HeroCarouselProps) {
  if (slides.length === 0) return null;

  return (
    <section
      className={styles.carousel}
      data-organism={identifier}
      aria-label="Featured stories"
    >
      <div className={styles.track}>
        {slides.map((slide, index) => {
          const key = `${identifier}-slide-${index}`;
          const content = (
            <>
              <img
                className={styles.image}
                src={slide.image}
                alt={slide.title}
                loading="lazy"
              />
              <div className={styles.overlay}>
                <span className={styles.category}>{slide.category_label}</span>
                <h2 className={styles.title}>{slide.title}</h2>
                {slide.excerpt ? <p className={styles.excerpt}>{slide.excerpt}</p> : null}
                {slide.read_time ? (
                  <span className={styles.readTime}>{slide.read_time}</span>
                ) : null}
              </div>
            </>
          );

          // Clickable when the slide has a linked article (url_slug).
          return slide.url_slug ? (
            <Link key={key} href={slide.url_slug} className={styles.slide}>
              {content}
            </Link>
          ) : (
            <article key={key} className={styles.slide}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default HeroCarousel;
