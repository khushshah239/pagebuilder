/**
 * Presentational prop contracts for every Article Page organism.
 *
 * As with the homepage, every value here is ALREADY RESOLVED by the binding
 * layer (e.g. `cover_image` is the absolute URL string). Organisms are purely
 * presentational and never touch the CDS payload directly.
 *
 * Kept entirely separate from the homepage organism types.
 */

// ─── ArticleHeader (article-header) ──────────────────────────────────────────
export interface ArticleHeaderProps {
  identifier: string;
  title: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  read_time?: string;
}

// ─── ArticleHero (article-hero) ──────────────────────────────────────────────
export interface ArticleHeroProps {
  identifier: string;
  cover_image: string;
  excerpt?: string;
  caption?: string;
}

// ─── ArticleSummary (article-summary) ────────────────────────────────────────
export interface ArticleKeyPoint {
  text: string;
}

export interface ArticleSummaryProps {
  identifier: string;
  heading?: string;
  key_points: ArticleKeyPoint[];
}

// ─── ArticleBody (article-body) ──────────────────────────────────────────────
export interface ArticleBodyProps {
  identifier: string;
  /** Rich-text HTML string from the CDS `body` / `content` field. */
  body: string;
}

// ─── ShareBar (share-bar) ────────────────────────────────────────────────────
export interface ShareButton {
  platform_name: string;
  icon?: string;
  url?: string;
}

export interface ShareBarProps {
  identifier: string;
  label?: string;
  share_buttons: ShareButton[];
}

// ─── TagsRow (tags-row) ──────────────────────────────────────────────────────
export interface ArticleTag {
  title: string;
  url_slug?: string;
}

export interface TagsRowProps {
  identifier: string;
  heading?: string;
  article_tags: ArticleTag[];
}

// ─── RelatedArticlesRow (related-articles) ───────────────────────────────────
export interface RelatedCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface RelatedArticlesRowProps {
  identifier: string;
  heading?: string;
  related_cards: RelatedCard[];
}

// ─── MoreFromAuthorRow (more-from-author) ────────────────────────────────────
export interface AuthorArticle {
  title: string;
  thumbnail: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface MoreFromAuthorRowProps {
  identifier: string;
  heading?: string;
  author_articles: AuthorArticle[];
}

// ─── ArticleFooter (article-footer) ──────────────────────────────────────────
export interface ArticleFooterProps {
  identifier: string;
  publisher_name?: string;
  logo?: string;
  copyright_text?: string;
}

// ─── InlineVideoEmbed (inline-video) ─────────────────────────────────────────
export interface InlineVideoEmbedProps {
  identifier: string;
  video_url: string;
  thumbnail?: string;
  caption?: string;
}

// ─── TrendingArticlesRow (trending-articles) ─────────────────────────────────
export interface TrendingCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  url_slug?: string;
}

export interface TrendingArticlesRowProps {
  identifier: string;
  heading?: string;
  trending_cards: TrendingCard[];
}

// ─── LiveBlogFeed (live-blog) ────────────────────────────────────────────────
export interface LiveUpdate {
  timestamp?: string;
  published_at?: string;
  author?: string;
  author_name?: string;
  author_url?: string;
  body?: string;
  title?: string;
  image?: string;
  thumbnail?: string;
  url?: string;
  url_slug?: string;
  category_label?: string;
  category_url?: string;
}

export interface LiveBlogFeedProps {
  identifier: string;
  blog_title?: string;
  live_updates: LiveUpdate[];
}

// ─── SidebarLatestNews (sidebar-latest-news) ─────────────────────────────────
export interface SidebarLatestNewsItem {
  title: string;
  thumbnail?: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface SidebarLatestNewsProps {
  identifier: string;
  heading?: string;
  items: SidebarLatestNewsItem[];
}
