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

// ─── Per-organism build specs ───────────────────────────────────────────────
// `kind` selects how an article organism's props are built:
//   single – scalar slots filled from the post via a non-indexed binding
//            (`summary → excerpt`), template default as fallback.
//   list   – a repeated item array filled from an indexed binding
//            (`related_article.results.N.* → card`), template default fallback.
//   static – no live binding; slots are read straight from the template default
//            (ShareBar buttons, ArticleSummary key points, ArticleFooter).
//
// Only `list` needs configuration — the prop name the component expects for its
// item array; the binding never names that array. `single`/`static` props are
// derived entirely from the data, so nothing about the post is hardcoded here.
type ArticleOrganismSpec =
  | { kind: "single" }
  | { kind: "static" }
  // `defaultHeading` is the section title shown when the template default carries
  // no `heading` of its own. A template-set heading always wins.
  | { kind: "list"; itemsProp: string; defaultHeading?: string };

/** How each article organism (keyed by `schema_slug`) builds its props. */
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

/** Normalize an organism id for loose matching: lowercase, strip hyphens/underscores. */
function normalizeOrganismId(id: string): string {
  return id.toLowerCase().replace(/[-_]/g, "");
}

/**
 * The field-map for an organism id from the template's `data_binding`.
 * Tries exact match first, then normalized match so that e.g. "tags-row"
 * in the binding matches the schema_slug "tagsrow" on the layout node.
 */
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

/** Coerce a slot value: media keys become URL strings, everything else as-is. */
function coerce(key: string, value: unknown): unknown {
  return MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
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
  const heading = firstDynamicField(node).heading;
  return typeof heading === "string" ? heading : "";
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
 * How many items to fetch for an article list organism: one past the highest
 * array-index the binding references. Falls back to `fallback` when there is
 * no indexed binding (template not configured). Mirrors `videoFeedSize` —
 * the count is always read from the template, never hardcoded in the route.
 */
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

/**
 * Build presentational props for one article organism: live bound data when
 * present, otherwise the template's inline defaults. `data` is the resolution
 * root (the post fields merged with its `custom_entity`). Returns `null` for
 * organisms with no matching build spec.
 */
export function buildArticleOrganismProps(
  node: CdsLayoutOrganism,
  template: CdsArticleTemplate,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const spec = ARTICLE_ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;

  const id = organismId(node);

  if (spec.kind === "static") {
    // Contentful organism: slots come from the template default, but a live
    // binding (if the template defines one) overrides the inline items.
    const liveItems = resolveBoundItems(articleBinding(template, id), data);
    // The article's API summary is already shown as the hero standfirst, so the
    // summary box's template FALLBACK key points would just repeat it — drop
    // them in that case (live-bound key points are still kept).
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
    // Template defaults first, then overlay each non-blank live bound value.
    const props: Record<string, unknown> = { identifier: id, ...defaultProps(node) };
    for (const { source, target } of fieldMap) {
      const live = getByPath(data, source);
      if (!isBlank(live)) props[target] = coerce(target, live);
    }
    // Header category box: fall back to the post's own `primary_category` (name
    // + section URL) when the binding didn't map it, so the clickable category
    // pill always renders. An explicit binding still wins (set above).
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
      // Byline author: fall back to the post's own author (`member`, then the
      // first `contributor`) for the name + author-page URL when the binding
      // didn't map them, so the clickable author link always renders. An
      // explicit binding still wins (set above).
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

  // Tags: resolved through the standard binding engine so the editor's choice
  // of count and order is respected exactly. Falls back to all post tags only
  // when there is no binding at all.
  if (node.schema_slug === "tagsrow") {
    const liveItems = resolveBoundItems(fieldMap, data);

    let article_tags: { title: string; url_slug: string }[];

    if (liveItems.length > 0) {
      // Binding present — use only the resolved items (exact count + order).
      article_tags = liveItems
        .map((item) => ({
          title: ((item.title ?? item.name ?? item.tag_name) as string) || "",
          url_slug:
            ((item.url_slug ?? item.absolute_url ?? item.slug) as string) || "",
        }))
        .filter((t) => t.title);
    } else {
      // No binding — fall back to every tag on the post.
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

  // list organism: live items the template's binding resolves (the editor's
  // chosen articles) → fall back to the template's inline default items when
  // there's no live data.
  const liveItems = resolveBoundItems(fieldMap, data).map(flattenMediaFields);
  const items = liveItems.length > 0 ? liveItems : nestedItems(node);

  const result: Record<string, unknown> = {
    identifier: id,
    [spec.itemsProp]: items,
    // Template-default heading wins; fall back to the spec's default label.
    heading: templateHeading(node) || (spec.defaultHeading ?? ""),
  };

  // Pass through any scalar (non-nested) fields from the template default that
  // aren't already covered — e.g. `blog_title` on the live-blog organism.
  for (const [key, val] of Object.entries(firstDynamicField(node))) {
    if (key === "id" || key in result) continue;
    const container = val as { dynamic_fields?: unknown[] };
    if (Array.isArray(container?.dynamic_fields)) continue;
    result[key] = coerce(key, val);
  }

  return result;
}
