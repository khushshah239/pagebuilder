import { buildOrganismProps, organismId } from "@/lib/homepage/buildProps";
import type {
  CdsLayoutOrganism,
  HomepageCustomEntity,
} from "@/types/homepage/cds.types";
import {
  AppPromoCard,
  BreakingNewsStrip,
  FeaturedArticles,
  HeroCarousel,
  LiveTVBanner,
  NewsletterSignupStrip,
  OpinionEditorialRow,
  PhotoGalleryTeaserRail,
  PostGrid,
  SectionRow,
  SponsoredContentStrip,
  TopStoriesList,
  TrendingTopicsChips,
  VideoBriefingsRail,
  WebStoryRail,
} from "@/organisms/homepage";

// Covers both sync and async server components (React 19 supports both).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = (props: any) => any;

/**
 * Maps a CDS `schema_slug` to its presentational organism component.
 *
 * The resolver builds props dynamically (a `Record<string, unknown>` shaped to
 * each organism's contract), so the map is typed with `ComponentType<any>`: the
 * compile-time prop type per organism is enforced where each organism is defined,
 * not at this dynamic dispatch boundary.
 */
const ORGANISM_COMPONENTS: Record<string, AnyComponent> = {
  herocarousel: HeroCarousel,
  postgrid_with_hero_image: PostGrid,
  breakingnewsstrip: BreakingNewsStrip,
  livetvbanner: LiveTVBanner,
  featuredarticles: FeaturedArticles,
  sectionrow: SectionRow,
  topstorieslist: TopStoriesList,
  opinioneditorialrow: OpinionEditorialRow,
  webstoryrail: WebStoryRail,
  videobriefingsrail: VideoBriefingsRail,
  photogalleryteaserrail: PhotoGalleryTeaserRail,
  trendingtopicschips: TrendingTopicsChips,
  sponsoredcontentstrip: SponsoredContentStrip,
  newslettersignupstrip: NewsletterSignupStrip,
  apppromocard: AppPromoCard,
};

/**
 * Walk the template layout in render order and draw each organism with props
 * built from live CDS data (falling back to the template's inline defaults).
 * Organisms with no matching component or no resolvable props are skipped.
 */
export function HomepageRenderer({ data }: { data: HomepageCustomEntity }) {
  const template = data.template?.[0];
  if (!template) return null;

  return (
    <>
      {template.layout.map((node: CdsLayoutOrganism, index: number) => {
        const Component = ORGANISM_COMPONENTS[node.schema_slug];
        if (!Component) return null;

        const props = buildOrganismProps(node, template, data);
        if (!props) return null;

        return <Component key={organismId(node) || index} {...props} />;
      })}
    </>
  );
}
