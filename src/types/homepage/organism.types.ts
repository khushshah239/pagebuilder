// Props for every homepage organism.
// Each interface = one organism's data contract.
//
// IMPORTANT: every field here is a RESOLVED value produced by the binding layer
// (e.g. `image` is already the absolute URL string, not the raw CDS media object).
// Components are purely presentational and never touch the CDS payload directly.

// ─── HeroCarousel ───────────────────────────────────────────────────────────
export interface HeroCarouselSlide {
  title: string;
  image: string;
  category_label: string;
  excerpt?: string;
  read_time?: string;
}

export interface HeroCarouselProps {
  identifier: string;
  slides: HeroCarouselSlide[];
}

// ─── BreakingNewsStrip ──────────────────────────────────────────────────────
export interface BreakingHeadline {
  title: string;
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
}

export interface FeaturedArticlesProps {
  identifier: string;
  cards: FeaturedCard[];
}

// ─── SectionRow ─────────────────────────────────────────────────────────────
export interface SectionRowCard {
  title: string;
  thumbnail: string;
}

export interface SectionRowProps {
  identifier: string;
  heading?: string;
  cards: SectionRowCard[];
}

// ─── TopStoriesList ─────────────────────────────────────────────────────────
export interface TopStory {
  title: string;
}

export interface TopStoriesListProps {
  identifier: string;
  heading?: string;
  stories: TopStory[];
}

// ─── VideoBriefingsRail ─────────────────────────────────────────────────────
export interface VideoBriefingCard {
  title: string;
  thumbnail: string;
  duration_label?: string;
}

export interface VideoBriefingsRailProps {
  identifier: string;
  heading?: string;
  videos: VideoBriefingCard[];
}

// ─── PostGrid (postgrid_with_hero_image) ────────────────────────────────────
export interface PostGridSideCard {
  title: string;
  thumbnail: string;
}

export interface PostGridProps {
  identifier: string;
  title: string;
  image: string;
  excerpt?: string;
  sidecards: PostGridSideCard[];
}

// ─── WebStoryRail ───────────────────────────────────────────────────────────
export interface WebStoryBubble {
  title: string;
  thumbnail: string;
}

export interface WebStoryRailProps {
  identifier: string;
  stories: WebStoryBubble[];
}

// ─── TrendingTopicsChips ────────────────────────────────────────────────────
export interface TrendingChip {
  label: string;
}

export interface TrendingTopicsChipsProps {
  identifier: string;
  chips: TrendingChip[];
}

// ─── OpinionEditorialRow ────────────────────────────────────────────────────
export interface OpinionCard {
  title: string;
  thumbnail: string;
  category_label?: string;
  excerpt?: string;
}

export interface OpinionEditorialRowProps {
  identifier: string;
  heading?: string;
  items: OpinionCard[];
}

// ─── AppPromoCard ───────────────────────────────────────────────────────────
export interface AppPromoCardProps {
  identifier: string;
  title: string;
  cta_label: string;
  background_image: string;
}

// ─── NewsletterSignupStrip ──────────────────────────────────────────────────
export interface NewsletterSignupStripProps {
  identifier: string;
  title: string;
  cta_label: string;
  background_image: string;
}

// ─── LiveTVBanner ───────────────────────────────────────────────────────────
// Not present in the sample template payload; contract inferred from the
// component name + sibling organisms. Adjust once a real binding exists.
export interface LiveTVBannerProps {
  identifier: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  cta_label?: string;
}
