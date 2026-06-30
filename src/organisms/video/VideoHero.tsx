import { PbImage } from "@/components/PbImage";
import type { VideoHeroProps } from "@/types/video/organism.types";
import styles from "@/styles/organisms/video/VideoHero.module.css";

// Renders the CMS-supplied iframe HTML via `dangerouslySetInnerHTML` inside a
// 16:9 aspect-ratio wrapper so any inline width/height attributes on the iframe
// are overridden by CSS. The iframe is trusted publisher-controlled content from
// the Publive CDS (meta_data.meta_video_embed).
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
            <PbImage
              className={styles.poster}
              src={thumbnail}
              alt="Video thumbnail"
              fillParent
              priority
              sizes="(max-width: 768px) 100vw, min(1200px, 100vw)"
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
