/**
 * Presentational prop contracts for every homepage organism.
 *
 * Each interface = one organism's data contract. Every value here is ALREADY
 * RESOLVED by the binding layer (e.g. `image` is the absolute URL string, not a
 * raw CDS media object). Organisms are purely presentational and never touch the
 * CDS payload directly.
 *
 * `url_slug` (where present) is the post's legacy_url carried through the binding
 * layer; a card renders as a link when it is set, and as a plain block otherwise.
 */

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

// ─── PostGrid (postgrid_with_hero_image) ────────────────────────────────────
// A normal list organism: the first item is the main hero, the rest are side
// cards. The lead carries `image`/`excerpt`; side cards carry `thumbnail`.
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

// ─── LiveTVBanner ───────────────────────────────────────────────────────────
export interface LiveTVBannerProps {
  identifier: string;
  channel_name: string;
  thumbnail?: string;
  live_label?: string;
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
  /** Fallback when the CMS binding targets "url" instead of "url_slug". */
  url?: string;
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
  /** CMS field: Android button label (field key "cta(Android)"). */
  "cta(Android)"?: string;
  /** CMS field: iPhone button label (field key "cta(iphone)"). */
  "cta(iphone)"?: string;
  background_image?: string;
  /** Allows CDS-sanitized variants (e.g. cta_android, ctaAndroid) to flow through. */
  [key: string]: unknown;
}
