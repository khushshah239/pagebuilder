import type { NewsletterSignupStripProps } from "../../types/homepage/organism.types";
import styles from "../../styles/organisms/homepage/NewsletterSignupStrip.module.css";

/** Inline newsletter email-capture strip with a background image and CTA. */
export function NewsletterSignupStrip({
  identifier,
  title,
  cta_label,
  background_image,
}: NewsletterSignupStripProps) {
  return (
    <section
      className={styles.strip}
      data-organism={identifier}
      style={{ backgroundImage: `url(${background_image})` }}
      aria-label={title}
    >
      <div className={styles.overlay}>
        <h2 className={styles.title}>{title}</h2>
        <form className={styles.form} action="#" method="post">
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Your email address"
            aria-label="Email address"
          />
          <button type="submit" className={styles.cta}>
            {cta_label}
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSignupStrip;
