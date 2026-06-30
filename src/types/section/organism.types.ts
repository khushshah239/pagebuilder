export interface SectionHeroBannerProps {
  identifier: string;
  section_name?: string;
}

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
