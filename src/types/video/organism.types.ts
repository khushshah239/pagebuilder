// Presentational prop contracts for Video Page organisms; all values pre-resolved.

// ─── VideoHero ───────────────────────────────────────────────────────────────
export interface VideoHeroProps {
  identifier: string;
  video_embed?: string; // raw iframe HTML; rendered via dangerouslySetInnerHTML
  video_url?: string; // fallback link when no embed HTML is present
  thumbnail?: string;
}

// ─── VideoHeader ─────────────────────────────────────────────────────────────
export interface VideoHeaderProps {
  identifier: string;
  title: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  author_avatar?: string;
  published_at?: string;
}
