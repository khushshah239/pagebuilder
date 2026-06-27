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

/** Maps schema_slug to its organism component. */
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

/** Renders homepage organisms in template layout order. */
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

        // Pass all props (including `heading`) straight to the organism — each
        // organism renders its own heading inline within its row (in the same
        // header row as its left/right scroll buttons where present), using the
        // `heading` value from the CDS homepage response.
        return <Component key={organismId(node) || index} {...props} />;
      })}
    </>
  );
}
