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

// `organismId` is re-exported so the renderer keeps importing it from here.
export { organismId } from "@/lib/cds/organism";

// ─── Per-organism build specs ───────────────────────────────────────────────
// `kind` selects how props are built:
//   list   – a repeated item array (slides/cards/…) with live → default fallback
//   static – fixed props read straight from the template layout (no binding)
type ListSpec = {
  kind: "list";
  /** The array prop the component expects (e.g. "slides", "cards"). */
  itemsProp: string;
  /** The inner slot in the template default that holds fallback items. */
  defaultSlot: string | null;
  /** Non-bound singleton props read from the template default (e.g. "label"). */
  singletons?: string[];
  /**
   * When true, the organism's lead item lives at the template default's TOP
   * level (e.g. PostGrid's hero `title`/`image`/`excerpt`), not inside the
   * `defaultSlot`. On fallback it is prepended to the slot items so the rendered
   * array matches the live shape (`items[0]` = lead, the rest = supporting cards).
   */
  leadFromDefault?: boolean;
  /**
   * Section title used when neither the data slot nor the template default
   * supplies a `heading`. A CMS-set heading always wins — this is only the
   * default label for organisms (e.g. the trending chips) whose Relation data
   * carries no heading of its own.
   */
  defaultHeading?: string;
};
type StaticSpec = { kind: "static"; props: string[] };
type OrganismSpec = ListSpec | StaticSpec;

/** How each homepage organism (keyed by `schema_slug`) builds its props. */
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
  // First bound item = main hero, the rest = side cards (handled in the component).
  // The hero sits at the template default's top level; `sidecards` holds the rest.
  postgrid_with_hero_image: {
    kind: "list",
    itemsProp: "items",
    defaultSlot: "sidecards",
    leadFromDefault: true,
  },
};

/** The homepage's own slot for a static organism (e.g. `apppromocard`), if filled. */
function homepageSlotFields(
  data: HomepageCustomEntity,
  schemaSlug: string
): Record<string, unknown> {
  const slot = data[schemaSlug] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return slot?.dynamic_fields?.[0] ?? {};
}

/**
 * The section heading from the CDS data slot that feeds this organism. The slot
 * name is the prefix of the binding's first source (e.g. `sports_row` from
 * `sports_row.results.0.title`); its `heading` field is the editor's label.
 * Returns "" when the slot has no heading, so the organism renders no title
 * rather than a hardcoded one.
 */
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

/**
 * The lead item built from the template default's top-level fields (everything
 * except `id` and the items `slot`), with media flattened to URL strings. Used
 * by organisms whose hero lives at the organism root rather than inside the slot.
 */
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

/**
 * Build presentational props for one organism: live bound data when present,
 * otherwise the template's inline defaults. Returns `null` for organisms with no
 * matching build spec.
 */
export function buildOrganismProps(
  node: CdsLayoutOrganism,
  template: CdsTemplate,
  data: HomepageCustomEntity
): Record<string, unknown> | null {
  const spec = ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;

  const id = organismId(node);

  if (spec.kind === "static") {
    // Static organisms: homepage slot value first, template default as fallback.
    const live = homepageSlotFields(data, node.schema_slug);
    const fallback = firstDynamicField(node);

    // Start with ALL fields from the template default so custom CMS fields
    // (e.g. "cta(Android)", "cta_android") flow through regardless of their
    // exact stored key name — no need to declare every variant in spec.props.
    const props: Record<string, unknown> = { identifier: id };
    for (const [key, val] of Object.entries(fallback)) {
      if (key === "id") continue;
      props[key] = flattenMedia(val);
    }

    // Declared props: live slot overrides the template default when non-blank.
    for (const prop of spec.props) {
      const liveValue = flattenMedia(live[prop]);
      if (!isBlank(liveValue)) props[prop] = liveValue;
    }
    return props;
  }

  // Trending topics: read directly from the Relation array on the data root.
  // The binding field_map uses hardcoded indices and won't pick up newly added
  // tags — reading the array directly always reflects what the editor saved.
  if (node.schema_slug === "trendingtopicschips") {
    // Try both the merged root and the nested custom_entity in case the CDS
    // response places the Relation array at either level.
    const ce = data.custom_entity as Record<string, unknown> | undefined;
    const raw =
      (data.trending_topicss as unknown[] | undefined) ??
      (ce?.trending_topicss as unknown[] | undefined) ??
      [];
    console.log("[TrendingTopics] raw count:", raw.length, raw.slice(0, 2));
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

  // list organism: live items (via bindings) → fall back to template defaults.
  const fieldMap = bindingFor(template, id);
  let items = resolveBoundItems(fieldMap, data).map(flattenMediaFields);

  if (items.length === 0) {
    items = defaultItems(node, spec.defaultSlot);
    // For organisms whose lead lives at the default's top level (PostGrid),
    // prepend it so the fallback array matches the live shape (lead first).
    if (spec.leadFromDefault) {
      const lead = leadFromDefault(node, spec.defaultSlot);
      if (!isBlank(lead.title)) items = [lead, ...items];
    }
  }

  // Section title: editor's data-slot heading wins, then the organism's template
  // default `heading` (empty → organism shows no title). No hardcoded fallback —
  // the heading is page/template-driven only.
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
  // Singletons: live homepage slot wins over template default.
  const liveSlot = homepageSlotFields(data, node.schema_slug);
  for (const singleton of spec.singletons ?? []) {
    const liveVal = flattenMedia(liveSlot[singleton]);
    props[singleton] = !isBlank(liveVal)
      ? liveVal
      : (firstDynamicField(node)[singleton] ?? "");
  }
  return props;
}
