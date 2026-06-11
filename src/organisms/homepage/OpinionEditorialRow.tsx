import type { OpinionEditorialRowProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/OpinionEditorialRow.module.css";

/** Row of opinion / editorial cards with category and short excerpt. */
export function OpinionEditorialRow({
  identifier,
  heading,
  items,
}: OpinionEditorialRowProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label={heading ?? "Opinion & editorial"}
    >
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      <div className={styles.row}>
        {items.map((item, index) => (
          <article key={`${identifier}-item-${index}`} className={styles.card}>
            <img
              className={styles.thumbnail}
              src={item.thumbnail}
              alt={item.title}
              loading="lazy"
            />
            <div className={styles.body}>
              {item.category_label ? (
                <span className={styles.category}>{item.category_label}</span>
              ) : null}
              <h3 className={styles.title}>{item.title}</h3>
              {item.excerpt ? <p className={styles.excerpt}>{item.excerpt}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OpinionEditorialRow;
