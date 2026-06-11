import type { ComponentType } from "react";
import { buildOrganismProps, organismId } from "../../lib/homepage/buildProps";
import type {
  CdsLayoutOrganism,
  HomepageCustomEntity,
} from "../../types/homepage/cds.types";
import {
  AppPromoCard,
  BreakingNewsStrip,
  FeaturedArticles,
  HeroCarousel,
  NewsletterSignupStrip,
  OpinionEditorialRow,
  PostGrid,
  SectionRow,
  TopStoriesList,
  TrendingTopicsChips,
  VideoBriefingsRail,
  WebStoryRail,
} from "../../organisms/homepage";

/** Maps a CDS `schema_slug` to its presentational organism component. */
const COMPONENTS: Record<string, ComponentType<any>> = {
  breakingnewsstrip: BreakingNewsStrip,
  herocarousel: HeroCarousel,
  featuredarticles: FeaturedArticles,
  sectionrow: SectionRow,
  topstorieslist: TopStoriesList,
  videobriefingsrail: VideoBriefingsRail,
  postgrid_with_hero_image: PostGrid,
  webstoryrail: WebStoryRail,
  trendingtopicschips: TrendingTopicsChips,
  opinioneditorialrow: OpinionEditorialRow,
  apppromocard: AppPromoCard,
  newslettersignupstrip: NewsletterSignupStrip,
};

/**
 * Walks the template layout in order and renders each organism with props built
 * from live CDS data (falling back to the template's inline defaults). Organisms
 * without a matching component (e.g. `sponsoredcontentstrip`) are skipped.
 */
export function HomepageRenderer({ data }: { data: HomepageCustomEntity }) {
  const template = data.template?.[0];
  if (!template) return null;

  return (
    <>
      {template.layout.map((node: CdsLayoutOrganism, index: number) => {
        const Component = COMPONENTS[node.schema_slug];
        if (!Component) return null;

        const props = buildOrganismProps(node, template, data);
        if (!props) return null;

        return <Component key={organismId(node) || index} {...props} />;
      })}
    </>
  );
}
