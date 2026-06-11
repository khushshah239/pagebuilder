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
          <article key={`${identifier}-card-${index}`} className={styles.card}>
            <img
              className={styles.thumbnail}
              src={card.thumbnail}
              alt={card.title}
              loading="lazy"
            />
            <h3 className={styles.title}>{card.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SectionRow;
