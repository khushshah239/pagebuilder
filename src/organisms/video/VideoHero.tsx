import type { VideoHeroProps } from "@/types/video/organism.types";
import styles from "@/styles/organisms/video/VideoHero.module.scss";

/**
 * Full-width YouTube video embed at the top of a video page.
 *
 * Renders the CMS-supplied iframe HTML via `dangerouslySetInnerHTML` inside a
 * 16:9 aspect-ratio wrapper so any inline width/height attributes on the iframe
 * are overridden by CSS. The iframe is trusted publisher-controlled content from
 * the Publive CDS (meta_data.meta_video_embed), mirroring how ArticleBody
 * renders content_html.
 *
 * Falls back to a thumbnail poster link when no embed HTML is present, and to a
 * blank placeholder when neither the embed nor a poster is available.
 */
export function VideoHero({ identifier, video_embed, video_url, thumbnail }: VideoHeroProps) {
  if (!video_embed && !video_url && !thumbnail) return null;

  return (
    <figure className={styles.hero} data-organism={identifier}>
      {video_embed ? (
        <div
          className={styles.embedWrapper}
          dangerouslySetInnerHTML={{ __html: video_embed }}
        />
      ) : (
        <a
          className={styles.posterLink}
          href={video_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Play video"
        >
          {thumbnail ? (
            <img
              className={styles.poster}
              src={thumbnail}
              alt="Video thumbnail"
              loading="eager"
            />
          ) : (
            <span className={styles.posterFallback} aria-hidden="true" />
          )}
          <span className={styles.playBadge} aria-hidden="true">▶</span>
        </a>
      )}
    </figure>
  );
}
