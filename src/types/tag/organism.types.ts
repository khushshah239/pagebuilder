// Presentational prop contracts for TagPage organisms; all values pre-resolved.

// ─── TagHeroBanner ───────────────────────────────────────────────────────────
export interface TagHeroBannerProps {
  identifier: string;
  tag_name?: string;
  heading?: string; // fallback when tag_name is absent
}
