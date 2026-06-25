import { widenCdnImage } from "@/lib/media";
import type { InlineVideoEmbedProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/InlineVideoEmbed.module.scss";

function PlayIcon() {
  return (
    <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/**
 * Inline video block. Renders the poster as a click-through to the source URL
 * (opened in a new tab) rather than embedding an arbitrary third-party iframe,
 * so an untrusted `video_url` cannot inject markup into the page.
 */
export function InlineVideoEmbed({
  identifier,
  video_url,
  thumbnail,
  caption,
}: InlineVideoEmbedProps) {
  if (!video_url) return null;

  return (
    <figure className={styles.embed} data-organism={identifier}>
      <a
        className={styles.frame}
        href={video_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={caption || "Play video"}
      >
        {thumbnail ? (
          <img
            className={styles.poster}
            src={widenCdnImage(thumbnail)}
            alt={caption || ""}
            loading="lazy"
          />
        ) : (
          <span className={styles.posterFallback} aria-hidden="true" />
        )}
        <span className={styles.play} aria-hidden="true">
          <PlayIcon />
        </span>
      </a>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
