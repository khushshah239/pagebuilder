export interface ArticleHeaderProps {
  identifier: string;
  title: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
}

export interface ArticleHeroProps {
  identifier: string;
  cover_image: string;
  excerpt?: string;
  caption?: string;
}

export interface ArticleBodyProps {
  identifier: string;
  body: string; // rich-text HTML
}

export interface ShareButton {
  platform_name: string;
  icon?: string;
  platform_link?: string;
}

export interface ShareBarProps {
  identifier: string;
  label?: string;
  share_buttons: ShareButton[];
}

export interface ArticleTag {
  title: string;
  url_slug?: string;
}

export interface TagsRowProps {
  identifier: string;
  heading?: string;
  article_tags: ArticleTag[];
}

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

export interface InlineVideoEmbedProps {
  identifier: string;
  video_url: string;
  thumbnail?: string;
  caption?: string;
}

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
