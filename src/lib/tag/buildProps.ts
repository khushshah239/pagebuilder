import { getByPath } from "@/lib/path";
import { isBlank } from "@/lib/value";
import { MEDIA_KEYS, flattenMedia, flattenMediaFields } from "@/lib/media";
import { resolveBoundItems } from "@/lib/bindings";
import { TAG_PAGE_SIZE } from "@/config/cds";
import type { TagPostsResponse } from "@/api/tagApi";
import type { TagHeroBannerProps } from "@/types/tag/organism.types";
import type { SectionFeedArticle } from "@/types/section/organism.types";
import type { CdsLayoutOrganism } from "@/types/article/cds.types";

type FieldMapEntry = { source: string; target: string };
type TagTemplate = Record<string, unknown>;

interface TagBinding {
  organism_id: string;
  field_map: { dynamic_fields: FieldMapEntry[] };
}

// Accepts `data_bindings` (plural, tag template) or `data_binding` (other templates).
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

/** Returns an organism's first inline default block. */
function organismDefault(
  template: TagTemplate,
  key: string
): Record<string, unknown> {
  const node = template[key] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return node?.dynamic_fields?.[0] ?? {};
}

function coerce(key: string, value: unknown): unknown {
  return MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
}

// Checks tag-feed first, then section-feed (when section template is reused for tags).
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

/** Returns static fallback feed rows from the template. */
function staticFeed(template: TagTemplate): SectionFeedArticle[] {
  const slot = organismDefault(template, "tag_feed").feed_articles as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (slot?.dynamic_fields ?? []).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
}

/** Builds tag feed from binding (tag-feed or section-feed), falling back to static rows. */
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

/** Builds tag hero props; context merges tag + posts so `tag.name` and `data.0.*` resolve. */
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

  // Ensure tag_name always shows even when the section template is reused.
  if (isBlank(props.tag_name)) {
    props.tag_name = (tag.name ?? tag.tag_name ?? tag.title) as string | undefined;
  }

  return props as unknown as TagHeroBannerProps;
}

/** Dispatches to the correct builder per schema_slug; returns null for unrecognized slugs. */
export function buildTagOrganismProps(
  node: CdsLayoutOrganism,
  template: TagTemplate,
  tag: Record<string, unknown>,
  posts: TagPostsResponse
): Record<string, unknown> | null {
  const slug = node.schema_slug;

  // Hero organisms: tag-specific or section template reuse
  if (
    slug === "tag_hero" || slug === "taghero" || slug === "tag-hero" ||
    slug === "section_hero" || slug === "sectionhero" || slug === "section-hero"
  ) {
    return buildTagHeroProps(template, tag, posts) as unknown as Record<string, unknown>;
  }

  // Feed organisms: tag-specific or section template reuse
  if (
    slug === "tag_feed" || slug === "tagfeed" || slug === "tag-feed" ||
    slug === "section_feed" || slug === "sectionfeed" || slug === "section-feed"
  ) {
    return { articles: buildTagFeedItems(template, posts) };
  }

  return null;
}
