/**
 * Presentational prop contracts for Video Page organisms.
 *
 * Mirrors the article/homepage conventions: every value here is ALREADY RESOLVED
 * by the binding layer. Organisms are purely presentational and never touch the
 * CDS payload directly.
 */

// ─── VideoHero (videohero) ────────────────────────────────────────────────────
export interface VideoHeroProps {
  identifier: string;
  /** Raw iframe HTML from meta_data.meta_video_embed — rendered via dangerouslySetInnerHTML. */
  video_embed?: string;
  /** Direct video URL — shown as a poster link when no embed HTML is present. */
  video_url?: string;
  /** Poster thumbnail used in the fallback link. */
  thumbnail?: string;
}

// ─── VideoHeader (videoheader) ────────────────────────────────────────────────
export interface VideoHeaderProps {
  identifier: string;
  title: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  /** Circular author avatar shown in the byline row. */
  author_avatar?: string;
  published_at?: string;
}
