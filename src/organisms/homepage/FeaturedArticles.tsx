import type { FeaturedArticlesProps } from "../../types/organism.types";
import styles from "../../styles/organisms/homepage/FeaturedArticles.module.css";

/** Highlighted stories shown as large image cards with a category tag. */
export function FeaturedArticles({ identifier, cards }: FeaturedArticlesProps) {
  if (cards.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label="Featured articles"
    >
      <div className={styles.grid}>
        {cards.map((card, index) => (
          <article key={`${identifier}-card-${index}`} className={styles.card}>
            <img
              className={styles.thumbnail}
              src={card.thumbnail}
              alt={card.title}
              loading="lazy"
            />
            <div className={styles.body}>
              {card.category_label ? (
                <span className={styles.category}>{card.category_label}</span>
              ) : null}
              <h3 className={styles.title}>{card.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturedArticles;
