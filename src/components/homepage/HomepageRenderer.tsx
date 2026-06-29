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
  NewsletterSignupStrip,
  OpinionEditorialRow,
  PostGrid,
  SectionRow,
  TopStoriesList,
  TrendingTopicsChips,
  VideoBriefingsRail,
  WebStoryRail,
} from "@/organisms/homepage";

type AnyComponent = (props: any) => any;

const ORGANISM_COMPONENTS: Record<string, AnyComponent> = {
  herocarousel: HeroCarousel,
  postgrid_with_hero_image: PostGrid,
  breakingnewsstrip: BreakingNewsStrip,
  featuredarticles: FeaturedArticles,
  sectionrow: SectionRow,
  topstorieslist: TopStoriesList,
  opinioneditorialrow: OpinionEditorialRow,
  webstoryrail: WebStoryRail,
  web_story_rail: WebStoryRail,
  videobriefingsrail: VideoBriefingsRail,
  trendingtopicschips: TrendingTopicsChips,
  newslettersignupstrip: NewsletterSignupStrip,
  apppromocard: AppPromoCard,
};

type Zone = "full" | "right" | "main";

// Slugs that render as a full-bleed / page-width band rather than inside a
// column. This is a layout-band concern, NOT a left/right decision — left vs
// right is read entirely from the organism name (see `zoneOf`).
const FULL_WIDTH_SLUGS = new Set([
  "breakingnewsstrip",
  "herocarousel",
  "trendingtopicschips",
]);

// Default column for organisms whose name carries no explicit zone prefix —
// applied only as a fallback. An explicit "left-*"/"main-*"/"right-*" name on
// the organism always overrides this, so editors stay in control.
const DEFAULT_RIGHT_SLUGS = new Set([
  "topstorieslist",
  "videobriefingsrail",
  "apppromocard",
]);

/** Resolve an organism's placement zone primarily from its name (the CDS `id`).
 *  - id "right-*" / "sidebar-*"  → right column
 *  - id "left-*"  / "main-*"     → main (left) column
 *  - id "full-*"                 → full-width band
 *  Editors control left/right by naming the organism. When the name has no zone
 *  prefix, the slug-based fallbacks (FULL_WIDTH_SLUGS / DEFAULT_RIGHT_SLUGS)
 *  preserve each organism's conventional placement. */
function zoneOf(node: CdsLayoutOrganism): Zone {
  const id = organismId(node);
  if (id.startsWith("right-") || id.startsWith("sidebar-")) return "right";
  if (id.startsWith("left-") || id.startsWith("main-")) return "main";
  if (id.startsWith("full-")) return "full";
  if (FULL_WIDTH_SLUGS.has(node.schema_slug)) return "full";
  if (DEFAULT_RIGHT_SLUGS.has(node.schema_slug)) return "right";
  return "main";
}

/** Dynamic-zone homepage. Walks the template layout in order, routing each
 *  organism to a full-width band, the main column, or the right column based on
 *  its name. Reordering the template layout reflects directly on the page. */
export function HomepageRenderer({ data }: { data: HomepageCustomEntity }) {
  const template = data.template?.[0];
  if (!template) return null;

  // Preserve template layout order within every zone.
  const fullNodes: CdsLayoutOrganism[] = [];
  const mainNodes: CdsLayoutOrganism[] = [];
  const sidebarNodes: CdsLayoutOrganism[] = [];

  for (const node of template.layout) {
    const zone = zoneOf(node);
    if (zone === "full") fullNodes.push(node);
    else if (zone === "right") sidebarNodes.push(node);
    else mainNodes.push(node);
  }

  function renderNode(node: CdsLayoutOrganism, index: number) {
    const Component = ORGANISM_COMPONENTS[node.schema_slug];
    if (!Component) return null;
    const props = buildOrganismProps(node, template!, data);
    if (!props) return null;
    return <Component key={organismId(node) || index} {...props} />;
  }

  return (
    <>
      {fullNodes.length > 0 && (
        <div className="pb-shell pb-homepage-hero">
          {fullNodes.map(renderNode)}
        </div>
      )}

      <div className={`pb-shell pb-homepage-body${sidebarNodes.length === 0 ? " pb-homepage-body--full" : ""}`}>
        <div className="pb-homepage-main">
          {mainNodes.map(renderNode)}
        </div>

        {sidebarNodes.length > 0 && (
          <aside className="pb-homepage-sidebar">
            {sidebarNodes.map((node, index) => (
              <div key={organismId(node) || index} className="pb-sidebar-block">
                {renderNode(node, index)}
              </div>
            ))}
          </aside>
        )}
      </div>
    </>
  );
}
