import type { LiveTVBannerProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/LiveTVBanner.module.scss";

/** Promotional strip linking to the publisher's live TV / live stream. */
export function LiveTVBanner({
  identifier,
  channel_name,
  thumbnail,
  live_label,
}: LiveTVBannerProps) {
  if (!channel_name) return null;

  return (
    <section className={styles.banner} data-organism={identifier}>
      {thumbnail ? (
        <img className={styles.thumb} src={thumbnail} alt={channel_name} loading="lazy" />
      ) : (
        <div className={styles.thumbFallback} aria-hidden="true" />
      )}
      <div className={styles.body}>
        <span className={styles.live}>
          <span className={styles.dot} aria-hidden="true" />
          {live_label}
        </span>
        <h2 className={styles.channel}>{channel_name}</h2>
      </div>
      <span className={styles.play} aria-hidden="true">
        ▶
      </span>
    </section>
  );
}
