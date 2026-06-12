import { CardLink } from "../../components/CardLink";
import type { SectionRowProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/SectionRow.module.css";

/** A row of section/category article cards with thumbnails. */
export function SectionRow({ identifier, heading, cards }: SectionRowProps) {
  if (cards.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label={heading ?? "Section"}
    >
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      <div className={styles.row}>
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

export default SectionRow;
