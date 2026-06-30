export interface HeroCarouselSlide {
  title: string;
  image: string;
  category_label?: string;
  category_url?: string;
  excerpt?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface HeroCarouselProps {
  identifier: string;
  slides: HeroCarouselSlide[];
}

// First item is the hero; the rest are side cards.
export interface PostGridItem {
  title: string;
  image?: string;
  thumbnail?: string;
  excerpt?: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface PostGridProps {
  identifier: string;
  heading?: string;
  items: PostGridItem[];
}

export interface BreakingHeadline {
  title: string;
  url_slug?: string;
}

export interface BreakingNewsStripProps {
  identifier: string;
  label: string;
  headlines: BreakingHeadline[];
}

export interface FeaturedCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface FeaturedArticlesProps {
  identifier: string;
  heading?: string;
  cards: FeaturedCard[];
}

export interface SectionRowCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface SectionRowProps {
  identifier: string;
  heading?: string;
  cards: SectionRowCard[];
}

export interface TopStory {
  title: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface TopStoriesListProps {
  identifier: string;
  heading?: string;
  stories: TopStory[];
}

export interface OpinionCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  category_url?: string;
  excerpt?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface OpinionEditorialRowProps {
  identifier: string;
  heading?: string;
  items: OpinionCard[];
}

export interface WebStoryBubble {
  title?: string;
  thumbnail: string;
  url_slug?: string;
}

export interface WebStoryRailProps {
  identifier: string;
  heading?: string;
  stories: WebStoryBubble[];
}

export interface VideoBriefingCard {
  title: string;
  thumbnail: string;
  duration_label?: string;
  category_label?: string;
  category_url?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
  url?: string; // fallback when binding targets "url" instead of "url_slug"
}

export interface VideoBriefingsRailProps {
  identifier: string;
  heading?: string;
  videos: VideoBriefingCard[];
}

export interface TrendingChip {
  label: string;
  url_slug?: string;
  url?: string;
  legacy_url?: string;
}

export interface TrendingTopicsChipsProps {
  identifier: string;
  heading?: string;
  chips: TrendingChip[];
}

export interface NewsletterSignupStripProps {
  identifier: string;
  title: string;
  cta_label: string;
  background_image?: string;
}

export interface AppPromoCardProps {
  identifier: string;
  title: string;
  "cta(Android)"?: string;
  "cta(iphone)"?: string;
  background_image?: string;
  [key: string]: unknown; // allows CDS-sanitized key variants (e.g. cta_android)
}
