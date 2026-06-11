import type { AppPromoCardProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/AppPromoCard.module.css";

/** Promotional banner driving app downloads, with a background image and CTA. */
export function AppPromoCard({
  identifier,
  title,
  cta_label,
  background_image,
}: AppPromoCardProps) {
  return (
    <section
      className={styles.card}
      data-organism={identifier}
      style={{ backgroundImage: `url(${background_image})` }}
      aria-label={title}
    >
      <div className={styles.overlay}>
        <h2 className={styles.title}>{title}</h2>
        <button type="button" className={styles.cta}>
          {cta_label}
        </button>
      </div>
    </section>
  );
}

export default AppPromoCard;
