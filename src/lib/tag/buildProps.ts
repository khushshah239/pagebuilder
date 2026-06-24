import { getByPath } from "@/lib/path";
import { isBlank } from "@/lib/value";
import { MEDIA_KEYS, flattenMedia, flattenMediaFields } from "@/lib/media";
import { resolveBoundItems } from "@/lib/bindings";
import { TAG_PAGE_SIZE } from "@/config/cds";
import type { TagPostsResponse } from "@/api/tagApi";
import type { TagHeroBannerProps } from "@/types/tag/organism.types";
import type { SectionFeedArticle } from "@/types/section/organism.types";
import type { CdsLayoutOrganism } from "@/types/article/cds.types";

/**
 * Resolve TagPage organism props from the shared template + live data: the tag
 * record feeds the hero (`tag.name → tag_name`) and a page of the tag's articles
 * feeds the feed (`data.N.* → card`), exactly mirroring the SectionPage resolver.
 */

type FieldMapEntry = { source: string; target: string };
type TagTemplate = Record<string, unknown>;

interface TagBinding {
  organism_id: string;
  field_map: { dynamic_fields: FieldMapEntry[] };
}

/**
 * The field-map for one tag organism from the template's binding block. The
 * TagPage schema names it `data_bindings` (plural); other templates use the
 * singular `data_binding`, so accept either.
 */
function tagBinding(
  template: TagTemplate,
  organismId: string
): FieldMapEntry[] {
  const binding = (template.data_bindings ?? template.data_binding) as
    | { dynamic_fields?: TagBinding[] }
    | undefined;
  const entry = binding?.dynamic_fields?.find(
    (candidate) => candidate.organism_id === organismId
  );
  if (!entry) return [];
  return (
    entry.field_map?.dynamic_fields ??
    (entry as unknown as { dynamic_fields?: FieldMapEntry[] }).dynamic_fields ??
    []
  );
}

/** An organism's inline default block (its static fallback content). */
function organismDefault(
  template: TagTemplate,
  key: string
): Record<string, unknown> {
  const node = template[key] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return node?.dynamic_fields?.[0] ?? {};
}

/** Coerce a slot value: media keys become URL strings, everything else as-is. */
function coerce(key: string, value: unknown): unknown {
  return MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
}

/**
 * How many of the tag's articles to fetch. Checks `tag-feed` first (dedicated
 * tag template), then `section-feed` (when the section template is reused for
 * tag pages). Falls back to TAG_PAGE_SIZE when neither binding is configured.
 */
export function tagFeedSize(template: TagTemplate): number {
  for (const orgId of ["tag-feed", "section-feed"]) {
    let maxIndex = -1;
    for (const { source } of tagBinding(template, orgId)) {
      const match = source.match(/^data\.(\d+)\./);
      if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
    }
    if (maxIndex >= 0) return maxIndex + 1;
  }
  return TAG_PAGE_SIZE;
}

/** Static fallback feed rows stored on the template (media flattened to URLs). */
function staticFeed(template: TagTemplate): SectionFeedArticle[] {
  const slot = organismDefault(template, "tag_feed").feed_articles as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (slot?.dynamic_fields ?? []).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
}

/**
 * Resolve the tag feed using the same binding approach as section pages.
 * Checks `tag-feed` first (dedicated tag template), then falls back to
 * `section-feed` (when the section page template is reused for tag pages).
 * This mirrors `buildSectionFeedItems` exactly, so images and all card fields
 * resolve identically to category pages.
 */
export function buildTagFeedItems(
  template: TagTemplate,
  posts: TagPostsResponse
): SectionFeedArticle[] {
  const tagFeedMap = tagBinding(template, "tag-feed");
  const fieldMap = tagFeedMap.length > 0
    ? tagFeedMap
    : tagBinding(template, "section-feed");

  const live = resolveBoundItems(fieldMap, posts).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
  return live.length > 0 ? live : staticFeed(template);
}

/**
 * Resolve the tag hero: the template's inline defaults (e.g. `heading`) first,
 * then each non-blank live value bound from the tag record or posts.
 * Context is `{ tag, data, page_no }` so bindings like `tag.name` and
 * `data.0.title` both resolve correctly from the same object.
 */
export function buildTagHeroProps(
  template: TagTemplate,
  tag: Record<string, unknown>,
  posts: TagPostsResponse
): TagHeroBannerProps {
  const props: Record<string, unknown> = { identifier: "tag-hero" };

  for (const [key, value] of Object.entries(organismDefault(template, "tag_hero"))) {
    if (key !== "id") props[key] = coerce(key, value);
  }

  const context = { tag, ...posts };
  for (const { source, target } of tagBinding(template, "tag-hero")) {
    const live = getByPath(context, source);
    if (!isBlank(live)) props[target] = coerce(target, live);
  }

  // Always show the tag name — even when no tag-hero binding exists (e.g.
  // when the section template is reused and has no tag-hero organism).
  if (isBlank(props.tag_name)) {
    props.tag_name = (tag.name ?? tag.tag_name ?? tag.title) as string | undefined;
  }

  return props as unknown as TagHeroBannerProps;
}

/**
 * Build presentational props for one tag page organism: routes each organism
 * schema_slug to the correct builder so `TagRenderer` can iterate all template
 * organisms dynamically (mirrors `buildVideoOrganismProps`).
 * Returns `null` for organism types not handled by this page.
 */
export function buildTagOrganismProps(
  node: CdsLayoutOrganism,
  template: TagTemplate,
  tag: Record<string, unknown>,
  posts: TagPostsResponse
): Record<string, unknown> | null {
  const slug = node.schema_slug;

  // Hero organisms — tag-specific or section template reuse
  if (
    slug === "tag_hero" || slug === "taghero" || slug === "tag-hero" ||
    slug === "section_hero" || slug === "sectionhero" || slug === "section-hero"
  ) {
    return buildTagHeroProps(template, tag, posts) as unknown as Record<string, unknown>;
  }

  // Feed organisms — tag-specific or section template reuse
  if (
    slug === "tag_feed" || slug === "tagfeed" || slug === "tag-feed" ||
    slug === "section_feed" || slug === "sectionfeed" || slug === "section-feed"
  ) {
    return { articles: buildTagFeedItems(template, posts) };
  }

  return null;
}
