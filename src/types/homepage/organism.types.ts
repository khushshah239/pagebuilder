// Presentational prop contracts for homepage organisms; all values pre-resolved.

// ─── HeroCarousel ───────────────────────────────────────────────────────────
export interface HeroCarouselSlide {
  title: string;
  image: string;
  category_label?: string;
  category_url?: string;
  excerpt?: string;
  read_time?: string;
  author_name?: string;
  author_url?: string;
  published_at?: string;
  url_slug?: string;
}

export interface HeroCarouselProps {
  identifier: string;
  slides: HeroCarouselSlide[];
}

// ─── PostGrid ───────────────────────────────────────────────────────────────
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

// ─── BreakingNewsStrip ──────────────────────────────────────────────────────
export interface BreakingHeadline {
  title: string;
  url_slug?: string;
}

export interface BreakingNewsStripProps {
  identifier: string;
  label: string;
  headlines: BreakingHeadline[];
}

// ─── FeaturedArticles ───────────────────────────────────────────────────────
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

// ─── SectionRow ─────────────────────────────────────────────────────────────
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

// ─── TopStoriesList ─────────────────────────────────────────────────────────
export interface TopStory {
  title: string;
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

// ─── OpinionEditorialRow ────────────────────────────────────────────────────
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

// ─── WebStoryRail ───────────────────────────────────────────────────────────
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

// ─── VideoBriefingsRail ─────────────────────────────────────────────────────
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

// ─── PhotoGalleryTeaserRail ─────────────────────────────────────────────────
export interface GalleryTeaser {
  title: string;
  thumbnail: string;
  category_label?: string;
  url_slug?: string;
}

export interface PhotoGalleryTeaserRailProps {
  identifier: string;
  heading?: string;
  gallery_teasers: GalleryTeaser[];
}

// ─── TrendingTopicsChips ────────────────────────────────────────────────────
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

// ─── SponsoredContentStrip ──────────────────────────────────────────────────
export interface SponsoredCard {
  title: string;
  thumbnail: string;
  brand_name?: string;
  url_slug?: string;
}

export interface SponsoredContentStripProps {
  identifier: string;
  sponsor_label?: string;
  sponsored_cards: SponsoredCard[];
}

// ─── NewsletterSignupStrip ──────────────────────────────────────────────────
export interface NewsletterSignupStripProps {
  identifier: string;
  title: string;
  cta_label: string;
  background_image?: string;
}

// ─── AppPromoCard ───────────────────────────────────────────────────────────
export interface AppPromoCardProps {
  identifier: string;
  title: string;
  "cta(Android)"?: string;
  "cta(iphone)"?: string;
  background_image?: string;
  [key: string]: unknown; // allows CDS-sanitized key variants (e.g. cta_android)
}
