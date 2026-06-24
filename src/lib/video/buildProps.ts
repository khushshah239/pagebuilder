import { resolveBoundItems } from "@/lib/bindings";
import { firstDynamicField, isBlank, organismId } from "@/lib/cds/organism";
import { flattenMedia, flattenMediaFields } from "@/lib/media";
import { getByPath } from "@/lib/path";
import type { CdsFieldMapEntry, CdsLayoutOrganism } from "@/types/article/cds.types";

/**
 * Resolve VideoPage organism props from the shared video template + live post
 * data. Mirrors article/buildProps.ts in structure — the key difference is that
 * the video template uses `data_bindings` (plural, like the tag template) and its
 * `custom_entity` carries named-key organisms whose key IS the schema_slug.
 */

// ─── Media keys ──────────────────────────────────────────────────────────────
// Local set so `author_avatar` is flattened without touching the global MEDIA_KEYS,
// and `video_embed` is deliberately excluded — it is raw iframe HTML, not a URL.
const VIDEO_MEDIA_KEYS = new Set([
  "image",
  "thumbnail",
  "background_image",
  "cover_image",
  "avatar",
  "logo",
  "icon",
  "author_avatar", // video-specific: flatten CDS media object → URL string
  // NOTE: "video_embed" is intentionally absent — it is raw iframe HTML
]);

// ─── Per-organism build specs ─────────────────────────────────────────────────
// `kind` selects how props are built (mirrors article/buildProps.ts spec shapes):
//   single – scalar slots filled from the post via a non-indexed binding,
//             template default as fallback (e.g. videohero, videoheader, videobody).
//   list   – a repeated item array filled from an indexed binding,
//             template default fallback (e.g. tagsrow, morefromauthor).
type VideoOrganismSpec =
  | { kind: "single" }
  | { kind: "list"; itemsProp: string; defaultHeading?: string };

/** How each video template organism (keyed by `schema_slug`) builds its props. */
const VIDEO_ORGANISM_SPECS: Record<string, VideoOrganismSpec> = {
  videohero: { kind: "single" },
  videoheader: { kind: "single" },
  videobody: { kind: "single" },
  tagsrow: { kind: "list", itemsProp: "article_tags" },
  morefromauthorrow: {
    kind: "list",
    itemsProp: "author_articles",
    defaultHeading: "More from the author",
  },
  relatedarticlesrow: {
    kind: "list",
    itemsProp: "related_cards",
    defaultHeading: "Related Articles",
  },
  "sidebar-latest-news": {
    kind: "list",
    itemsProp: "items",
    defaultHeading: "Latest News",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize an organism id: lowercase, strip hyphens/underscores. */
function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[-_]/g, "");
}

/**
 * The field-map for one video organism from the template's `data_bindings`.
 * Accepts both `data_bindings` (plural — the video template) and `data_binding`
 * (singular — other templates) so this helper is forward-compatible.
 * Tries exact match first, then normalized match so that e.g. "related-articles-row"
 * in the binding matches the schema_slug "relatedarticlesrow" on the layout node.
 */
function videoBinding(
  template: Record<string, unknown>,
  id: string
): CdsFieldMapEntry[] {
  const block = (template.data_bindings ?? template.data_binding) as
    | {
        dynamic_fields?: Array<{
          organism_id: string;
          field_map: { dynamic_fields: CdsFieldMapEntry[] };
        }>;
      }
    | undefined;
  const entries = block?.dynamic_fields ?? [];
  const normId = normalizeId(id);
  const entry =
    entries.find((b) => b.organism_id === id) ??
    entries.find((b) => normalizeId(b.organism_id) === normId);
  return entry?.field_map.dynamic_fields ?? [];
}

/** Coerce a slot value: video-specific media keys → URL string; everything else as-is. */
function coerce(key: string, value: unknown): unknown {
  return VIDEO_MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
}

/** Template inline defaults (sans the binding `id`), media flattened to URLs. */
function defaultProps(node: CdsLayoutOrganism): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(firstDynamicField(node))) {
    if (key === "id") continue;
    out[key] = coerce(key, value);
  }
  return out;
}

/** Editor-overridable section title from the template default (empty → none). */
function templateHeading(node: CdsLayoutOrganism): string {
  const h = firstDynamicField(node).heading;
  return typeof h === "string" ? h : "";
}

/** The first nested `{ dynamic_fields }` container in a list organism default. */
function nestedItems(node: CdsLayoutOrganism): Record<string, unknown>[] {
  for (const value of Object.values(firstDynamicField(node))) {
    const container = value as { dynamic_fields?: Record<string, unknown>[] };
    if (container && Array.isArray(container.dynamic_fields)) {
      return container.dynamic_fields.map(flattenMediaFields);
    }
  }
  return [];
}

/**
 * The top-level data key the binding uses as its source root for a list
 * organism (e.g. `"related_article"` from `"related_article.results.0.title"`).
 * Returns an empty string when the organism has no binding.
 */
export function videoBindingRootField(
  template: Record<string, unknown>,
  schemaSlug: string
): string {
  const first = videoBinding(template, schemaSlug)[0]?.source ?? "";
  return first.split(".")[0];
}

/**
 * How many items to fetch for a video list organism: one past the highest
 * array-index the binding references so every bound slot has data. Falls back
 * to `fallback` when the organism has no indexed binding (e.g. no template
 * configured). Mirrors `tagFeedSize` — count comes from the binding, never
 * hardcoded.
 */
export function videoFeedSize(
  template: Record<string, unknown>,
  schemaSlug: string,
  fallback: number
): number {
  let maxIndex = -1;
  for (const { source } of videoBinding(template, schemaSlug)) {
    const match = source.match(/\.(\d+)(?:\.|$)/);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }
  return maxIndex >= 0 ? maxIndex + 1 : fallback;
}

// ─── Main builder ─────────────────────────────────────────────────────────────

/**
 * Build presentational props for one video page organism: live bound data when
 * present, otherwise the template's inline defaults. `node.schema_slug` is the
 * template key, injected by the renderer before calling here. `data` is the
 * resolution root (post fields merged with its `custom_entity`). Returns `null`
 * for organisms with no matching build spec.
 */
export function buildVideoOrganismProps(
  node: CdsLayoutOrganism,
  template: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const spec = VIDEO_ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;

  // organism_id = id field inside the template default, falling back to schema_slug.
  const id = organismId(node);

  if (spec.kind === "single") {
    // Template defaults first, then overlay each non-blank live bound value.
    const props: Record<string, unknown> = { identifier: id, ...defaultProps(node) };
    for (const { source, target } of videoBinding(template, id)) {
      const live = getByPath(data, source);
      if (!isBlank(live)) props[target] = coerce(target, live);
    }

    // VideoHeader: auto-fill category + author when the binding didn't map them,
    // mirroring the articleheader fallback in article/buildProps.ts so the category
    // pill and byline always render even when the template skips those binding entries.
    if (node.schema_slug === "videoheader") {
      const category = data.primary_category as
        | { name?: string; absolute_url?: string }
        | undefined;
      if (isBlank(props.category_label) && category?.name) {
        props.category_label = category.name;
      }
      if (isBlank(props.category_url) && category?.absolute_url) {
        props.category_url = category.absolute_url;
      }
      const author = (data.member ?? (data.contributors as unknown[])?.[0]) as
        | { name?: string; absolute_url?: string; avatar?: unknown }
        | undefined;
      if (isBlank(props.author_name) && author?.name) {
        props.author_name = author.name;
      }
      if (isBlank(props.author_url) && author?.absolute_url) {
        props.author_url = author.absolute_url;
      }
      if (isBlank(props.author_avatar) && !isBlank(author?.avatar)) {
        props.author_avatar = flattenMedia(author!.avatar);
      }
    }

    return props;
  }

  // list organism: live items from the binding → template inline defaults as fallback.
  const fieldMap = videoBinding(template, id);
  const liveItems = resolveBoundItems(fieldMap, data).map(flattenMediaFields);
  const items = liveItems.length > 0 ? liveItems : nestedItems(node);

  return {
    identifier: id,
    [spec.itemsProp]: items,
    heading: templateHeading(node) || (spec.defaultHeading ?? ""),
  };
}
