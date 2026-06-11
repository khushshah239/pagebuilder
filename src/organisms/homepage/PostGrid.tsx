import type { PostGridProps } from "../../types/organism.types";
import styles from "../../styles/organisms/homepage/PostGrid.module.css";

/**
 * A lead story with a hero image alongside a column of smaller side cards.
 * Mirrors the CDS `postgrid_with_hero_image` organism.
 */
export function PostGrid({
  identifier,
  title,
  image,
  excerpt,
  sidecards,
}: PostGridProps) {
  return (
    <section
      className={styles.section}
      data-organism={identifier}
      aria-label={title}
    >
      <article className={styles.lead}>
        <img className={styles.leadImage} src={image} alt={title} loading="lazy" />
        <div className={styles.leadBody}>
          <h2 className={styles.leadTitle}>{title}</h2>
          {excerpt ? <p className={styles.leadExcerpt}>{excerpt}</p> : null}
        </div>
      </article>

      {sidecards.length > 0 ? (
        <div className={styles.sideColumn}>
          {sidecards.map((card, index) => (
            <article key={`${identifier}-side-${index}`} className={styles.sideCard}>
              <img
                className={styles.sideThumbnail}
                src={card.thumbnail}
                alt={card.title}
                loading="lazy"
              />
              <h3 className={styles.sideTitle}>{card.title}</h3>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default PostGrid;
