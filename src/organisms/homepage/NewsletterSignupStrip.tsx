import { PbImage } from "@/components/PbImage";
import type { NewsletterSignupStripProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/NewsletterSignupStrip.module.css";

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
          <PbImage src={background_image} alt="" aria-hidden fillParent placeholder="none" sizes="100vw" />
        </span>
      ) : null}
      <span className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.iconBadge} aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </div>
        <div className={styles.copy}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <form className={styles.form} action="#" aria-label="Newsletter signup">
          <input
            className={styles.input}
            type="email"
            aria-label="Email address"
            placeholder="Your email address"
          />
          {cta_label ? (
            <button className={styles.button} type="submit">{cta_label}</button>
          ) : null}
        </form>
        <p className={styles.privacy}>🔒 We respect your privacy. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
