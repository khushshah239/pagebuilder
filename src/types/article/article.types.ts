// Props for every article-detail organism.
// Each interface = one organism's data contract.
//
// Like organism.types.ts, every field is a RESOLVED value produced by the
// binding layer (e.g. `cover_image` is already the absolute URL string).

// ─── ArticleHero ────────────────────────────────────────────────────────────
export interface ArticleHeroProps {
  identifier: string;
  cover_image: string;
  excerpt?: string;
}

// ─── ArticleHeader ──────────────────────────────────────────────────────────
export interface ArticleHeaderProps {
  identifier: string;
  title: string;
  published_at?: string;
}

// ─── ArticleSummary ─────────────────────────────────────────────────────────
export interface ArticleKeyPoint {
  text: string;
}

export interface ArticleSummaryProps {
  identifier: string;
  heading?: string;
  key_points: ArticleKeyPoint[];
}

// ─── ArticleBody ────────────────────────────────────────────────────────────
export interface ArticleBodyProps {
  identifier: string;
  /** Rich-text HTML from the CMS. */
  body: string;
}

// ─── ShareBar ───────────────────────────────────────────────────────────────
export interface ShareButton {
  platform_name: string;
  icon: string;
}

export interface ShareBarProps {
  identifier: string;
  share_buttons: ShareButton[];
}

// ─── TagsRow ────────────────────────────────────────────────────────────────
export interface ArticleTag {
  title: string;
}

export interface TagsRowProps {
  identifier: string;
  tags: ArticleTag[];
}

// ─── RelatedArticlesRow ─────────────────────────────────────────────────────
export interface RelatedArticleCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  url_slug?: string;
}

export interface RelatedArticlesRowProps {
  identifier: string;
  heading?: string;
  cards: RelatedArticleCard[];
}

// ─── MoreFromAuthorRow ──────────────────────────────────────────────────────
export interface AuthorArticleCard {
  title: string;
  thumbnail: string;
  published_at?: string;
  url_slug?: string;
}

export interface MoreFromAuthorRowProps {
  identifier: string;
  heading?: string;
  articles: AuthorArticleCard[];
}

// ─── ArticleFooter ──────────────────────────────────────────────────────────
export interface ArticleFooterProps {
  identifier: string;
  publisher_name: string;
  copyright_text: string;
  logo?: string;
}
