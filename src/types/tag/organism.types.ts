/**
 * Presentational prop contracts for the TagPage organisms. Values are already
 * resolved by the tag binding layer, mirroring the section/author conventions.
 *
 * The article feed reuses the SectionPage's `SectionFeedArticle` + card, so the
 * tag page renders identically to a category page below the hero.
 */

// ─── TagHeroBanner (tag-hero) ────────────────────────────────────────────────
export interface TagHeroBannerProps {
  identifier: string;
  /** Tag name shown as the page title (e.g. "footballl"), bound from `tag.name`. */
  tag_name?: string;
  /** Template-default heading, used when no `tag_name` resolves. */
  heading?: string;
}
