import { resolveBoundItems } from "@/lib/bindings";
import { firstDynamicField, isBlank, organismId } from "@/lib/cds/organism";
import { flattenMedia, flattenMediaFields } from "@/lib/media";
import { getByPath } from "@/lib/path";
import type { CdsFieldMapEntry, CdsLayoutOrganism } from "@/types/article/cds.types";

// video_embed is intentionally excluded — it is raw iframe HTML, not a URL.
const VIDEO_MEDIA_KEYS = new Set([
  "image",
  "thumbnail",
  "background_image",
  "cover_image",
  "avatar",
  "logo",
  "icon",
  "author_avatar",
]);

// kind: "single" = scalar binding, "list" = item array
type VideoOrganismSpec =
  | { kind: "single" }
  | { kind: "list"; itemsProp: string; defaultHeading?: string };

/** Build spec per video organism schema_slug. */
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

/** Normalizes an organism id (lowercase, no hyphens/underscores). */
function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[-_]/g, "");
}

// Accepts data_bindings or data_binding; tries exact then normalized id match.
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

/** Flattens video media keys to URL strings; passes everything else through. */
function coerce(key: string, value: unknown): unknown {
  return VIDEO_MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
}

/** Returns template inline defaults with media flattened to URL strings. */
function defaultProps(node: CdsLayoutOrganism): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(firstDynamicField(node))) {
    if (key === "id") continue;
    out[key] = coerce(key, value);
  }
  return out;
}

/** Returns the template's heading string, or "" if absent. */
function templateHeading(node: CdsLayoutOrganism): string {
  const h = firstDynamicField(node).heading;
  return typeof h === "string" ? h : "";
}

/** Returns the first nested dynamic_fields array from a list organism's default. */
function nestedItems(node: CdsLayoutOrganism): Record<string, unknown>[] {
  for (const value of Object.values(firstDynamicField(node))) {
    const container = value as { dynamic_fields?: Record<string, unknown>[] };
    if (container && Array.isArray(container.dynamic_fields)) {
      return container.dynamic_fields.map(flattenMediaFields);
    }
  }
  return [];
}

/** Returns the top-level data key from the binding's first source path. */
export function videoBindingRootField(
  template: Record<string, unknown>,
  schemaSlug: string
): string {
  const first = videoBinding(template, schemaSlug)[0]?.source ?? "";
  return first.split(".")[0];
}

/** Returns fetch count from the binding's max array index, or `fallback` if unconfigured. */
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

/** Builds props for one video organism from live data or template defaults. */
export function buildVideoOrganismProps(
  node: CdsLayoutOrganism,
  template: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const spec = VIDEO_ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;

  const id = organismId(node);

  if (spec.kind === "single") {
    const props: Record<string, unknown> = { identifier: id, ...defaultProps(node) };
    for (const { source, target } of videoBinding(template, id)) {
      const live = getByPath(data, source);
      if (!isBlank(live)) props[target] = coerce(target, live);
    }

    // VideoHeader: auto-fill category + author from post fields when binding omits them.
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

  // list organism: live bound items → template inline defaults as fallback.
  const fieldMap = videoBinding(template, id);
  const liveItems = resolveBoundItems(fieldMap, data).map(flattenMediaFields);
  const items = liveItems.length > 0 ? liveItems : nestedItems(node);

  return {
    identifier: id,
    [spec.itemsProp]: items,
    heading: templateHeading(node) || (spec.defaultHeading ?? ""),
  };
}
