import { resolveBoundItems } from "@/lib/bindings";
import { firstDynamicField, isBlank, organismId } from "@/lib/cds/organism";
import { MEDIA_KEYS, flattenMedia, flattenMediaFields } from "@/lib/media";
import { getByPath } from "@/lib/path";
import type {
  CdsArticleTemplate,
  CdsBinding,
  CdsFieldMapEntry,
  CdsLayoutOrganism,
} from "@/types/article/cds.types";

// kind: "single" = scalar slots from binding, "list" = item array, "static" = template-only
type ArticleOrganismSpec =
  | { kind: "single" }
  | { kind: "static" }
  | { kind: "list"; itemsProp: string; defaultHeading?: string };

/** Build spec per article organism schema_slug. */
const ARTICLE_ORGANISM_SPECS: Record<string, ArticleOrganismSpec> = {
  articlehero: { kind: "single" },
  articleheader: { kind: "single" },
  articlebody: { kind: "single" },
  inlinevideoembed: { kind: "single" },
  articlesummary: { kind: "static" },
  sharebar: { kind: "static" },
  articlefooter: { kind: "static" },
  relatedarticlesrow: {
    kind: "list",
    itemsProp: "related_cards",
    defaultHeading: "Related Articles",
  },
  morefromauthorrow: {
    kind: "list",
    itemsProp: "author_articles",
    defaultHeading: "More from the author",
  },
  tagsrow: { kind: "list", itemsProp: "article_tags" },
  trendingarticlesrow: {
    kind: "list",
    itemsProp: "trending_cards",
    defaultHeading: "Trending Now",
  },
  liveblogfeed: { kind: "list", itemsProp: "live_updates" },
  live_blog: { kind: "list", itemsProp: "live_updates" },
  "sidebar-latest-news": {
    kind: "list",
    itemsProp: "items",
    defaultHeading: "Latest News",
  },
};

/** Normalizes an organism id for loose matching (lowercase, no hyphens/underscores). */
function normalizeOrganismId(id: string): string {
  return id.toLowerCase().replace(/[-_]/g, "");
}

// Tries exact match then normalized match (e.g. "tags-row" matches "tagsrow").
function articleBinding(
  template: CdsArticleTemplate,
  id: string
): CdsFieldMapEntry[] {
  const bindings = template.data_binding?.dynamic_fields ?? [];
  const normId = normalizeOrganismId(id);
  const entry =
    bindings.find((b: CdsBinding) => b.organism_id === id) ??
    bindings.find((b: CdsBinding) => normalizeOrganismId(b.organism_id) === normId);
  return entry?.field_map.dynamic_fields ?? [];
}

function coerce(key: string, value: unknown): unknown {
  return MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
}

/** Template inline defaults with media flattened to URL strings. */
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
  const heading = firstDynamicField(node).heading;
  return typeof heading === "string" ? heading : "";
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

/** Returns fetch count from the binding's max array index, or `fallback` if unconfigured. */
export function articleFeedSize(
  template: CdsArticleTemplate,
  schemaSlug: string,
  fallback: number
): number {
  let maxIndex = -1;
  for (const { source } of articleBinding(template, schemaSlug)) {
    const match = source.match(/\.(\d+)(?:\.|$)/);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }
  return maxIndex >= 0 ? maxIndex + 1 : fallback;
}

/** Builds props for one article organism from live data or template defaults. */
export function buildArticleOrganismProps(
  node: CdsLayoutOrganism,
  template: CdsArticleTemplate,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const spec = ARTICLE_ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;

  const id = organismId(node);

  if (spec.kind === "static") {
    const liveItems = resolveBoundItems(articleBinding(template, id), data);
    // Drop summary key points when the post summary already fills the standfirst.
    const summaryCoveredByStandfirst =
      node.schema_slug === "articlesummary" && !isBlank(data.summary);

    const props: Record<string, unknown> = { identifier: id };
    for (const [key, value] of Object.entries(firstDynamicField(node))) {
      if (key === "id") continue;
      const container = value as { dynamic_fields?: Record<string, unknown>[] };
      if (Array.isArray(container?.dynamic_fields)) {
        if (liveItems.length > 0) {
          props[key] = liveItems.map(flattenMediaFields);
        } else if (summaryCoveredByStandfirst) {
          props[key] = [];
        } else {
          props[key] = container.dynamic_fields.map(flattenMediaFields);
        }
      } else {
        props[key] = coerce(key, value);
      }
    }

    return props;
  }

  const fieldMap = articleBinding(template, id);

  if (spec.kind === "single") {
    const props: Record<string, unknown> = { identifier: id, ...defaultProps(node) };
    for (const { source, target } of fieldMap) {
      const live = getByPath(data, source);
      if (!isBlank(live)) props[target] = coerce(target, live);
    }
    // Auto-fill category + author from post fields when the binding omits them.
    if (node.schema_slug === "articleheader") {
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
        | { name?: string; absolute_url?: string }
        | undefined;
      if (isBlank(props.author_name) && author?.name) {
        props.author_name = author.name;
      }
      if (isBlank(props.author_url) && author?.absolute_url) {
        props.author_url = author.absolute_url;
      }
    }
    return props;
  }

  // Tags: resolved via binding engine; falls back to all post tags when no binding.
  if (node.schema_slug === "tagsrow") {
    const liveItems = resolveBoundItems(fieldMap, data);

    let article_tags: { title: string; url_slug: string }[];

    if (liveItems.length > 0) {
      article_tags = liveItems
        .map((item) => ({
          title: ((item.title ?? item.name ?? item.tag_name) as string) || "",
          url_slug:
            ((item.url_slug ?? item.absolute_url ?? item.slug) as string) || "",
        }))
        .filter((t) => t.title);
    } else {
      const rawTags = Array.isArray(data.tags)
        ? (data.tags as Record<string, unknown>[])
        : Array.isArray((data.tags as Record<string, unknown>)?.results)
        ? ((data.tags as Record<string, unknown>).results as Record<string, unknown>[])
        : [];
      article_tags = rawTags
        .map((t) => ({
          title: ((t.name ?? t.tag_name ?? t.title) as string) || "",
          url_slug:
            ((t.absolute_url ?? t.url_slug ?? t.slug) as string) || "",
        }))
        .filter((t) => t.title);
    }

    return {
      identifier: id,
      article_tags,
      heading: templateHeading(node) || (spec.defaultHeading ?? ""),
    };
  }

  // list organism: live bound items → template inline defaults as fallback.
  const liveItems = resolveBoundItems(fieldMap, data).map(flattenMediaFields);
  const items = liveItems.length > 0 ? liveItems : nestedItems(node);

  const result: Record<string, unknown> = {
    identifier: id,
    [spec.itemsProp]: items,
    heading: templateHeading(node) || (spec.defaultHeading ?? ""),
  };

  // Pass through scalar template default fields not already set (e.g. blog_title).
  for (const [key, val] of Object.entries(firstDynamicField(node))) {
    if (key === "id" || key in result) continue;
    const container = val as { dynamic_fields?: unknown[] };
    if (Array.isArray(container?.dynamic_fields)) continue;
    result[key] = coerce(key, val);
  }

  return result;
}
