import { getByPath } from "@/lib/path";
import { isBlank } from "@/lib/value";
import { flattenMediaFields } from "@/lib/media";
import { resolveBoundItems } from "@/lib/bindings";
import { TAG_PAGE_SIZE } from "@/config/cds";
import type { TagHeroBannerProps } from "@/types/tag/organism.types";
import type { SectionFeedArticle } from "@/types/section/organism.types";
import type { TagPostsResponse } from "@/api/tagApi";

type FieldMapEntry = { source: string; target: string };
type TagTemplate = Record<string, unknown>;

interface TagBinding {
  organism_id: string;
  field_map: { dynamic_fields: FieldMapEntry[] };
}

/** Returns the field-map for one tag organism. Accepts `data_bindings` (plural, tag template) or `data_binding`. */
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
  return entry?.field_map.dynamic_fields ?? [];
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

// Uses max index (not count) so gaps in binding indices still fetch enough articles.
export function tagFeedSize(template: TagTemplate): number {
  let maxIndex = -1;
  for (const { source } of tagBinding(template, "tag-feed")) {
    const match = source.match(/^data\.(\d+)\./);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }
  return maxIndex >= 0 ? maxIndex + 1 : TAG_PAGE_SIZE;
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

/** Builds tag feed from live binding, falling back to template static rows. */
export function buildTagFeedItems(
  template: TagTemplate,
  posts: TagPostsResponse
): SectionFeedArticle[] {
  const fieldMap = tagBinding(template, "tag-feed");
  const live = resolveBoundItems(fieldMap, posts).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
  return live.length > 0 ? live : staticFeed(template);
}

/** Builds tag hero props from binding context (includes live tag.name). */
export function buildTagHeroProps(
  template: TagTemplate,
  tag: Record<string, unknown>,  
  posts: TagPostsResponse
): TagHeroBannerProps {
  const props: Record<string, unknown> = { identifier: "tag-hero" };

  for (const [key, value] of Object.entries(organismDefault(template, "tag_hero"))) {
    if (key !== "id") props[key] = value;
  }

  // Merge tag into context so `tag.name` resolves from the binding.
  const context = { ...posts, tag: tag ?? {} };

  for (const { source, target } of tagBinding(template, "tag-hero")) {
    const live = getByPath(context, source);//context.tag.name
    if (!isBlank(live)) props[target] = live;
  }

  return props as unknown as TagHeroBannerProps;
}
