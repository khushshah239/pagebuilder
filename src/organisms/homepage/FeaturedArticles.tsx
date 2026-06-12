import { CardLink } from "../../components/CardLink";
import type { FeaturedArticlesProps } from "../../types/homepage/organism.types";
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
          <CardLink
            key={`${identifier}-card-${index}`}
            href={card.url_slug}
            className={styles.card}
          >
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
              {card.author || card.published_at ? (
                <p className={styles.byline}>
                  {card.author ? (
                    <span className={styles.author}>By {card.author}</span>
                  ) : null}
                  {card.author && card.published_at ? " · " : null}
                  {card.published_at}
                </p>
              ) : null}
            </div>
          </CardLink>
        ))}
      </div>
    </section>
  );
}

export default FeaturedArticles;
