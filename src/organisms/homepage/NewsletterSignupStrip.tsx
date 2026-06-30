import { PbImage } from "@/components/PbImage";
import type { NewsletterSignupStripProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/NewsletterSignupStrip.module.css";

// Presentational only — the email field is non-functional here (wired by the
// host page if needed).
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
        <span className={styles.bg}>
          <PbImage
            src={background_image}
            alt=""
            aria-hidden
            fillParent
            placeholder="none"
            sizes="100vw"
          />
        </span>
      ) : null}
      <span className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.copy}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <form className={styles.form} action="#" aria-label="Newsletter signup">
          <input
            className={styles.input}
            type="email"
            aria-label="Email address"
            placeholder="Enter your email address"
          />
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
