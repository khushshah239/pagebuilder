import type { LiveTVBannerProps } from "../../types/organism.types";
import styles from "../../styles/organisms/homepage/LiveTVBanner.module.css";

/**
 * Live TV / streaming banner with a LIVE badge and an optional CTA.
 * Contract is inferred (no binding in the sample template) — revisit when the
 * CDS slot for this organism is defined.
 */
export function LiveTVBanner({
  identifier,
  title,
  subtitle,
  thumbnail,
  cta_label,
}: LiveTVBannerProps) {
  return (
    <section
      className={styles.banner}
      data-organism={identifier}
      style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}
      aria-label={title}
    >
      <div className={styles.overlay}>
        <span className={styles.liveBadge}>● LIVE</span>
        <h2 className={styles.title}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        {cta_label ? (
          <button type="button" className={styles.cta}>
            {cta_label}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default LiveTVBanner;
