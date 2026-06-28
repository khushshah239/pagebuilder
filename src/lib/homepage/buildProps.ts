import { resolveBoundItems } from "@/lib/bindings";
import {
  bindingFor,
  defaultItems,
  firstDynamicField,
  isBlank,
  organismId,
} from "@/lib/cds/organism";
import { flattenMedia, flattenMediaFields } from "@/lib/media";
import type {
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
  HomepageCustomEntity,
} from "@/types/homepage/cds.types";

// Re-exported for renderer compatibility.
export { organismId } from "@/lib/cds/organism";

// kind: "list" = item array with live→default fallback, "static" = template-only props
type ListSpec = {
  kind: "list";
  itemsProp: string;
  defaultSlot: string | null;
  singletons?: string[];
  // When true, lead item lives at the template default's top level (e.g. PostGrid).
  leadFromDefault?: boolean;
  defaultHeading?: string;
};
type StaticSpec = { kind: "static"; props: string[] };
type OrganismSpec = ListSpec | StaticSpec;

/** Build spec per homepage organism schema_slug. */
const ORGANISM_SPECS: Record<string, OrganismSpec> = {
  breakingnewsstrip:        { kind: "list",   itemsProp: "headlines",       defaultSlot: "ticker_headline",  singletons: ["label"] },
  herocarousel:             { kind: "list",   itemsProp: "slides",          defaultSlot: "slides" },
  featuredarticles:         { kind: "list",   itemsProp: "cards",           defaultSlot: "featured_card" },
  sectionrow:               { kind: "list",   itemsProp: "cards",           defaultSlot: "row_cards" },
  topstorieslist:           { kind: "list",   itemsProp: "stories",         defaultSlot: "ranked_stories" },
  videobriefingsrail:       { kind: "list",   itemsProp: "videos",          defaultSlot: "video_cards" },
  webstoryrail:             { kind: "list",   itemsProp: "stories",         defaultSlot: "story_bubbles" },
  trendingtopicschips:      { kind: "list",   itemsProp: "chips",           defaultSlot: "topic_chips",      defaultHeading: "Trending Topics" },
  opinioneditorialrow:      { kind: "list",   itemsProp: "items",           defaultSlot: null },
  photogalleryteaserrail:   { kind: "list",   itemsProp: "gallery_teasers", defaultSlot: "gallery_teasers" },
  sponsoredcontentstrip:    { kind: "list",   itemsProp: "sponsored_cards", defaultSlot: "sponsored_cards",  singletons: ["sponsor_label"] },
  postgrid_with_hero_image: { kind: "list",   itemsProp: "items",           defaultSlot: "sidecards",        leadFromDefault: true },
  apppromocard:             { kind: "static", props: ["title", "cta(Android)", "cta(iphone)", "background_image"] },
  newslettersignupstrip:    { kind: "static", props: ["title", "cta_label", "background_image"] },
};

/** Returns the first dynamic_fields entry from a homepage organism's data slot. */
function homepageSlotFields(
  data: HomepageCustomEntity,
  schemaSlug: string
): Record<string, unknown> {
  const slot = data[schemaSlug] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return slot?.dynamic_fields?.[0] ?? {};
}

/** Reads the heading from the data slot that feeds this organism (its first binding source). */
function slotHeading(
  fieldMap: CdsFieldMapEntry[],
  data: HomepageCustomEntity
): string {
  const slot = data[fieldMap[0]?.source.split(".")[0] ?? ""];
  if (slot && typeof slot === "object" && !Array.isArray(slot)) {
    const heading = (slot as Record<string, unknown>).heading;
    if (typeof heading === "string") return heading;
  }
  return "";
}

/** Builds the lead item from top-level template default fields (for the PostGrid hero). */
function leadFromDefault(
  node: CdsLayoutOrganism,
  slot: string | null
): Record<string, unknown> {
  const lead: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(firstDynamicField(node))) {
    if (key !== "id" && key !== slot) lead[key] = value;
  }
  return flattenMediaFields(lead);
}

/** Builds props for one homepage organism from live data, falling back to template defaults. */
export function buildOrganismProps(
  node: CdsLayoutOrganism,
  template: CdsTemplate,
  data: HomepageCustomEntity
): Record<string, unknown> | null {
  const spec = ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;

  const id = organismId(node);
  const defaults = firstDynamicField(node); // the organism's inline template default block

  // ── static: single-value organisms — template defaults overlaid by the live slot ──
  if (spec.kind === "static") {
    const live = homepageSlotFields(data, node.schema_slug);
    const props: Record<string, unknown> = { identifier: id };
    for (const [key, val] of Object.entries(defaults)) {
      if (key !== "id") props[key] = flattenMedia(val);
    }
    for (const prop of spec.props) {
      const liveVal = flattenMedia(live[prop]);
      if (!isBlank(liveVal)) props[prop] = liveVal;
    }
    return props;
  }

  // ── list: array organisms — live binding items, falling back to template defaults ──
  const fieldMap = bindingFor(template, id);
  let items = resolveBoundItems(fieldMap, data).map(flattenMediaFields);
  if (items.length === 0) {
    items = defaultItems(node, spec.defaultSlot);
    if (spec.leadFromDefault) {
      const lead = leadFromDefault(node, spec.defaultSlot);
      if (!isBlank(lead.title)) items = [lead, ...items];
    }
  }

  // Skip a list organism with no items so it never renders an empty block.
  if (items.length === 0) return null;

  const props: Record<string, unknown> = {
    identifier: id,
    [spec.itemsProp]: items,
    // heading priority: data-slot heading → template default → spec default.
    heading:
      slotHeading(fieldMap, data) ||
      (typeof defaults.heading === "string" ? defaults.heading : "") ||
      (spec.defaultHeading ?? ""),
  };

  // Singletons (e.g. label, sponsor_label): live slot value wins over template default.
  if (spec.singletons?.length) {
    const live = homepageSlotFields(data, node.schema_slug);
    for (const singleton of spec.singletons) {
      const liveVal = flattenMedia(live[singleton]);
      props[singleton] = !isBlank(liveVal) ? liveVal : (defaults[singleton] ?? "");
    }
  }
  return props;
}
