import type { NewsletterSignupStripProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/NewsletterSignupStrip.module.css";

/**
 * Inline CTA banner for email newsletter subscription. Presentational only —
 * the email field is non-functional here (wired by the host page if needed).
 */
export function NewsletterSignupStrip({
  identifier,
  title,
  cta_label,
  background_image,
}: NewsletterSignupStripProps) {
  if (!title) return null;

  return (
    <section className={styles.strip} data-organism={identifier}>
      {background_image ? (
        <img
          className={styles.bg}
          src={background_image}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
      ) : null}
      <span className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.copy}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <form className={styles.form} action="#" aria-label="Newsletter signup">
          <input className={styles.input} type="email" aria-label="Email address" />
          {cta_label ? (
            <button className={styles.button} type="submit">
              {cta_label}
            </button>
          ) : null}
        </form>
      </div>
    </section>
  );
}
