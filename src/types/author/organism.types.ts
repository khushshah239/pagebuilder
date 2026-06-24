/**
 * Presentational prop contracts for the AuthorPage organisms. Values are already
 * resolved by the author binding layer (e.g. `avatar` is a URL string),
 * mirroring the homepage/section/article organism conventions.
 *
 * The article feed reuses the SectionPage's `SectionFeedArticle` + card, so the
 * author page renders identically to a category page below the header.
 */

// ─── AuthorProfileHeader (author-header) ─────────────────────────────────────
export interface AuthorProfileHeaderProps {
  identifier: string;
  author_name?: string;
  avatar?: string;
  bio?: string;
}
