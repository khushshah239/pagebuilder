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
  breakingnewsstrip: {
    kind: "list",
    itemsProp: "headlines",
    defaultSlot: "ticker_headline",
    singletons: ["label"],
  },
  herocarousel: { kind: "list", itemsProp: "slides", defaultSlot: "slides" },
  featuredarticles: { kind: "list", itemsProp: "cards", defaultSlot: "featured_card" },
  sectionrow: { kind: "list", itemsProp: "cards", defaultSlot: "row_cards" },
  topstorieslist: { kind: "list", itemsProp: "stories", defaultSlot: "ranked_stories" },
  videobriefingsrail: { kind: "list", itemsProp: "videos", defaultSlot: "video_cards" },
  webstoryrail: { kind: "list", itemsProp: "stories", defaultSlot: "story_bubbles" },
  trendingtopicschips: {
    kind: "list",
    itemsProp: "chips",
    defaultSlot: "topic_chips",
    defaultHeading: "Trending Topics",
  },
  opinioneditorialrow: { kind: "list", itemsProp: "items", defaultSlot: null },
  photogalleryteaserrail: {
    kind: "list",
    itemsProp: "gallery_teasers",
    defaultSlot: "gallery_teasers",
  },
  sponsoredcontentstrip: {
    kind: "list",
    itemsProp: "sponsored_cards",
    defaultSlot: "sponsored_cards",
    singletons: ["sponsor_label"],
  },
  apppromocard: {
    kind: "static",
    props: ["title", "cta(Android)", "cta(iphone)", "background_image"],
  },
  newslettersignupstrip: {
    kind: "static",
    props: ["title", "cta_label", "background_image"],
  },
  livetvbanner: { kind: "static", props: ["channel_name", "thumbnail", "live_label"] },
  // Hero at template top level; sidecards slot holds remaining cards.
  postgrid_with_hero_image: {
    kind: "list",
    itemsProp: "items",
    defaultSlot: "sidecards",
    leadFromDefault: true,
  },
};

/** Returns the first dynamic_fields entry from a homepage organism slot. */
function homepageSlotFields(
  data: HomepageCustomEntity,
  schemaSlug: string
): Record<string, unknown> {
  const slot = data[schemaSlug] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return slot?.dynamic_fields?.[0] ?? {};
}

// Reads the heading from the data slot that feeds this organism (from first binding source).
function slotHeading(
  fieldMap: CdsFieldMapEntry[],
  data: HomepageCustomEntity
): string {
  const firstSource = fieldMap[0]?.source;
  if (!firstSource) return "";
  const slot = data[firstSource.split(".")[0]];
  if (slot && typeof slot === "object" && !Array.isArray(slot)) {
    const heading = (slot as Record<string, unknown>).heading;
    return typeof heading === "string" ? heading : "";
  }
  return "";
}

// Builds the lead item from top-level template default fields (for PostGrid hero).
function leadFromDefault(
  node: CdsLayoutOrganism,
  slot: string | null
): Record<string, unknown> {
  const lead: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(firstDynamicField(node))) {
    if (key === "id" || key === slot) continue;
    lead[key] = value;
  }
  return flattenMediaFields(lead);
}

/** Builds props for one homepage organism from live data or template defaults. */
export function buildOrganismProps(
  node: CdsLayoutOrganism,
  template: CdsTemplate,
  data: HomepageCustomEntity
): Record<string, unknown> | null {
  const spec = ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;

  const id = organismId(node);

  if (spec.kind === "static") {
    const live = homepageSlotFields(data, node.schema_slug);
    const fallback = firstDynamicField(node);
    // Start with all template default fields so custom CMS key variants flow through.
    const props: Record<string, unknown> = { identifier: id };
    for (const [key, val] of Object.entries(fallback)) {
      if (key === "id") continue;
      props[key] = flattenMedia(val);
    }

    // Live slot overrides template default for declared props.
    for (const prop of spec.props) {
      const liveValue = flattenMedia(live[prop]);
      if (!isBlank(liveValue)) props[prop] = liveValue;
    }
    return props;
  }

  // Trending topics: read directly from the Relation array (binding indices are stale).
  if (node.schema_slug === "trendingtopicschips") {
    // Try both root and nested custom_entity — CDS may place the array at either level.
    const ce = data.custom_entity as Record<string, unknown> | undefined;
    const raw =
      (data.trending_topicss as unknown[] | undefined) ??
      (ce?.trending_topicss as unknown[] | undefined) ??
      [];
    const liveChips = Array.isArray(raw)
      ? (raw as { name?: string; absolute_url?: string }[])
          .map((t) => ({ label: t.name ?? "", url_slug: t.absolute_url ?? "" }))
          .filter((c) => c.label)
      : [];
    const chips =
      liveChips.length > 0 ? liveChips : defaultItems(node, spec.defaultSlot as string);
    return {
      identifier: id,
      chips,
      heading: spec.defaultHeading ?? "",
    };
  }

  // list organism: live bound items → template defaults as fallback.
  const fieldMap = bindingFor(template, id);
  let items = resolveBoundItems(fieldMap, data).map(flattenMediaFields);

  if (items.length === 0) {
    items = defaultItems(node, spec.defaultSlot);
    // Prepend lead item for organisms like PostGrid whose hero is at the top level.
    if (spec.leadFromDefault) {
      const lead = leadFromDefault(node, spec.defaultSlot);
      if (!isBlank(lead.title)) items = [lead, ...items];
    }
  }

  // Heading priority: data-slot heading → template default → spec default.
  const templateDefaultHeading = firstDynamicField(node).heading;
  const heading =
    slotHeading(fieldMap, data) ||
    (typeof templateDefaultHeading === "string" ? templateDefaultHeading : "") ||
    (spec.defaultHeading ?? "");

  const props: Record<string, unknown> = {
    identifier: id,
    [spec.itemsProp]: items,
    heading,
  };
  // Singletons: live slot value wins over template default.
  const liveSlot = homepageSlotFields(data, node.schema_slug);
  for (const singleton of spec.singletons ?? []) {
    const liveVal = flattenMedia(liveSlot[singleton]);
    props[singleton] = !isBlank(liveVal)
      ? liveVal
      : (firstDynamicField(node)[singleton] ?? "");
  }
  return props;
}
