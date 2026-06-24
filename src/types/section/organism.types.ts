/**
 * Presentational prop contracts for the SectionPage (category) organisms.
 * Values are already resolved by the section binding layer (e.g. `thumbnail` is
 * a URL string), mirroring the homepage/article organism conventions.
 */

// ─── SectionHeroBanner (section-hero) ────────────────────────────────────────
export interface SectionHeroBannerProps {
  identifier: string;
  /** Category name shown as the section title (e.g. "News"). */
  section_name?: string;
  /** Template-default heading, used when no `section_name` resolves. */
  heading?: string;
}

// ─── InfiniteArticleFeed (section-feed) ──────────────────────────────────────
export interface SectionFeedArticle {
  title: string;
  thumbnail?: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface InfiniteArticleFeedProps {
  identifier: string;
  feed_articles: SectionFeedArticle[];
}
