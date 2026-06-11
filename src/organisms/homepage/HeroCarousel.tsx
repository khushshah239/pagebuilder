import type { HeroCarouselProps } from "../../types/organism.types";
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
        {slides.map((slide, index) => (
          <article key={`${identifier}-slide-${index}`} className={styles.slide}>
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
          </article>
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
