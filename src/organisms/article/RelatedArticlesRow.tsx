import type { RelatedArticlesRowProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/RelatedArticlesRow.module.css";

/** "Related articles" — cards by tag or section. */
export function RelatedArticlesRow({
  identifier,
  heading,
  cards,
}: RelatedArticlesRowProps) {
  if (cards.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label={heading ?? "Related articles"}
    >
      <h2 className={styles.heading}>{heading ?? "Related Articles"}</h2>
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

export default RelatedArticlesRow;
