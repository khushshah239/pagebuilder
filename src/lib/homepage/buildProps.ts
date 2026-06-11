import { resolveBoundItems } from "./bindings";
import type {
  CdsBinding,
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
  HomepageCustomEntity,
} from "../../types/cds.types";

// ─── Per-organism specs ─────────────────────────────────────────────────────
// `kind` selects how props are built:
//   list     – a repeated item array (slides/cards/…) with live→default fallback
//   static   – fixed props read straight from the template layout (no binding)
//   postgrid – the one lead-story + side-cards special case

type ListSpec = {
  kind: "list";
  /** The array prop the component expects (e.g. "slides", "cards"). */
  itemsProp: string;
  /** The inner slot in the layout default that holds fallback items. */
  defaultSlot: string | null;
  /** Non-bound singleton props read from the layout default (e.g. "label"). */
  singletons?: string[];
};
type StaticSpec = { kind: "static"; props: string[] };
type PostGridSpec = { kind: "postgrid" };
type OrganismSpec = ListSpec | StaticSpec | PostGridSpec;

export const ORGANISM_SPECS: Record<string, OrganismSpec> = {
  breakingnewsstrip: { kind: "list", itemsProp: "headlines", defaultSlot: "ticker_headline", singletons: ["label"] },
  herocarousel: { kind: "list", itemsProp: "slides", defaultSlot: "slides" },
  featuredarticles: { kind: "list", itemsProp: "cards", defaultSlot: "featured_card" },
  sectionrow: { kind: "list", itemsProp: "cards", defaultSlot: "row_cards" },
  topstorieslist: { kind: "list", itemsProp: "stories", defaultSlot: "ranked_stories" },
  videobriefingsrail: { kind: "list", itemsProp: "videos", defaultSlot: "video_cards" },
  webstoryrail: { kind: "list", itemsProp: "stories", defaultSlot: "story_bubbles" },
  trendingtopicschips: { kind: "list", itemsProp: "chips", defaultSlot: "topic_chips" },
  opinioneditorialrow: { kind: "list", itemsProp: "items", defaultSlot: null },
  apppromocard: { kind: "static", props: ["title", "cta_label", "background_image"] },
  newslettersignupstrip: { kind: "static", props: ["title", "cta_label", "background_image"] },
  postgrid_with_hero_image: { kind: "postgrid" },
};

/** Prop keys whose values may be raw CDS media objects needing flattening. */
const MEDIA_KEYS = new Set(["image", "thumbnail", "background_image"]);

/** Reduce a CDS media object to its URL string; pass through primitives. */
function flattenMedia(value: unknown): unknown {
  if (value && typeof value === "object") {
    const media = value as Record<string, unknown>;
    return media.absolute_path ?? media.path ?? "";
  }
  return value ?? "";
}

/** Template-default items carry media as objects — flatten them to match props. */
function normalizeDefaultItem(item: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    out[key] = MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
  }
  return out;
}

function firstDynamicField(node: CdsLayoutOrganism): Record<string, unknown> {
  return node.dynamic_fields?.[0] ?? {};
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

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

function defaultItems(
  node: CdsLayoutOrganism,
  slot: string | null
): Record<string, unknown>[] {
  if (!slot) return [];
  const container = firstDynamicField(node)[slot] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (container?.dynamic_fields ?? []).map(normalizeDefaultItem);
}

function bindingFor(template: CdsTemplate, id: string): CdsFieldMapEntry[] {
  const binding = template.bindings.dynamic_fields.find(
    (entry: CdsBinding) => entry.organism_id === id
  );
  return binding?.field_map.dynamic_fields ?? [];
}

/** The organism's id (= `organism_id` used by bindings), falling back to slug. */
export function organismId(node: CdsLayoutOrganism): string {
  return (firstDynamicField(node).id as string) || node.schema_slug;
}

/**
 * Build the presentational props for one organism:
 * live bound data when present, otherwise the template's inline defaults.
 * Returns `null` for organisms with no matching component (e.g. sponsored strip).
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
    // Static cards follow the same rule: homepage slot first, template fallback.
    const live = homepageSlotFields(data, node.schema_slug);
    const fallback = firstDynamicField(node);
    const props: Record<string, unknown> = { identifier: id };
    for (const prop of spec.props) {
      const liveValue = flattenMedia(live[prop]);
      props[prop] = isBlank(liveValue) ? flattenMedia(fallback[prop]) : liveValue;
    }
    return props;
  }

  if (spec.kind === "postgrid") {
    return buildPostGridProps(id, node, template, data);
  }

  // list organism: live items (via bindings) → fall back to template defaults
  const liveItems = resolveBoundItems(bindingFor(template, id), data);
  const items = liveItems.length > 0 ? liveItems : defaultItems(node, spec.defaultSlot);

  const props: Record<string, unknown> = { identifier: id, [spec.itemsProp]: items };
  for (const singleton of spec.singletons ?? []) {
    props[singleton] = firstDynamicField(node)[singleton] ?? "";
  }
  return props;
}

/** PostGrid = a lead story (results.0) plus a column of side cards (results.1+). */
function buildPostGridProps(
  id: string,
  node: CdsLayoutOrganism,
  template: CdsTemplate,
  data: HomepageCustomEntity
): Record<string, unknown> {
  const groups = resolveBoundItems(bindingFor(template, id), data);
  const lead = groups[0];

  if (lead) {
    const sidecards = groups
      .slice(1)
      .map((group) => group.sidecards as Record<string, unknown> | undefined)
      .filter((card): card is Record<string, unknown> => Boolean(card));
    return {
      identifier: id,
      title: lead.title ?? "",
      image: lead.image ?? "",
      excerpt: lead.excerpt ?? "",
      sidecards,
    };
  }

  // fallback: template default lead + side cards
  const fields = firstDynamicField(node);
  const sideContainer = fields.sidecards as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return {
    identifier: id,
    title: fields.title ?? "",
    image: flattenMedia(fields.image),
    excerpt: fields.excerpt ?? "",
    sidecards: (sideContainer?.dynamic_fields ?? []).map(normalizeDefaultItem),
  };
}
