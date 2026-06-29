// Presentational prop contracts for Article Page organisms; all values pre-resolved.

// ─── ArticleHeader ────────────────────────────────────────────────────────────
export interface ArticleHeaderProps {
  identifier: string;
  title: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
}

// ─── ArticleHero ─────────────────────────────────────────────────────────────
export interface ArticleHeroProps {
  identifier: string;
  cover_image: string;
  excerpt?: string;
  caption?: string;
}

// ─── ArticleSummary ──────────────────────────────────────────────────────────
export interface ArticleKeyPoint {
  text: string;
}

export interface ArticleSummaryProps {
  identifier: string;
  heading?: string;
  key_points: ArticleKeyPoint[];
}

// ─── ArticleBody ─────────────────────────────────────────────────────────────
export interface ArticleBodyProps {
  identifier: string;
  body: string; // rich-text HTML
}

// ─── ShareBar ────────────────────────────────────────────────────────────────
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

// ─── TagsRow ─────────────────────────────────────────────────────────────────
export interface ArticleTag {
  title: string;
  url_slug?: string;
}

export interface TagsRowProps {
  identifier: string;
  heading?: string;
  article_tags: ArticleTag[];
}

// ─── RelatedArticlesRow ──────────────────────────────────────────────────────
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

// ─── MoreFromAuthorRow ───────────────────────────────────────────────────────
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

// ─── InlineVideoEmbed ────────────────────────────────────────────────────────
export interface InlineVideoEmbedProps {
  identifier: string;
  video_url: string;
  thumbnail?: string;
  caption?: string;
}

// ─── TrendingArticlesRow ─────────────────────────────────────────────────────
export interface TrendingCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface TrendingArticlesRowProps {
  identifier: string;
  heading?: string;
  trending_cards: TrendingCard[];
}

// ─── LiveBlogFeed ────────────────────────────────────────────────────────────
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

// ─── SidebarLatestNews ───────────────────────────────────────────────────────
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
