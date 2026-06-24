import { getByPath } from "@/lib/path";
import { isBlank } from "@/lib/value";
import { MEDIA_KEYS, flattenMedia, flattenMediaFields } from "@/lib/media";
import { resolveBoundItems } from "@/lib/bindings";
import { AUTHOR_PAGE_SIZE } from "@/config/cds";
import type { AuthorPostsResponse } from "@/api/authorApi";
import type { AuthorProfileHeaderProps } from "@/types/author/organism.types";
import type { SectionFeedArticle } from "@/types/section/organism.types";

/**
 * Resolve AuthorPage organism props from the shared template + live data: the
 * profile feeds the header (`member.* → …`) and a page of the author's articles
 * feeds the feed (`data.N.* → card`), exactly mirroring the SectionPage resolver.
 */

type FieldMapEntry = { source: string; target: string };
type AuthorTemplate = Record<string, unknown>;

interface AuthorBinding {
  organism_id: string;
  field_map: { dynamic_fields: FieldMapEntry[] };
}


/** The field-map for one author organism from the template's `data_binding`. */
function authorBinding(
  template: AuthorTemplate,
  organismId: string
): FieldMapEntry[] {
  const binding = template.data_binding as
    | { dynamic_fields?: AuthorBinding[] }
    | undefined;
  const entry = binding?.dynamic_fields?.find(
    (candidate) => candidate.organism_id === organismId
  );
  return entry?.field_map.dynamic_fields ?? [];
}

/** An organism's inline default block (its static fallback content). */
function organismDefault(
  template: AuthorTemplate,
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
 * Build the author header: template inline defaults first, then each non-blank
 * live value bound from the profile (`member.*`). Social links are read straight
 * from the profile's known platform fields (see {@link SOCIAL_PLATFORMS}).
 */
export function buildAuthorHeaderProps(
  template: AuthorTemplate,
  profile: Record<string, unknown>
): AuthorProfileHeaderProps {
  const props: Record<string, unknown> = { identifier: "author-header" };

  for (const [key, value] of Object.entries(
    organismDefault(template, "author_header")
  )) {
    if (key !== "id") props[key] = coerce(key, value);
  }

  const context = { member: profile };
  for (const { source, target } of authorBinding(template, "author-header")) {
    const live = getByPath(context, source);
    if (!isBlank(live)) props[target] = coerce(target, live);
  }

  return props as unknown as AuthorProfileHeaderProps;
}

/**
 * How many of the author's articles to fetch: one past the highest `data.N`
 * index the `author-feed` binding references — so the feed holds exactly the
 * articles the editor bound (a binding of `data.0..data.2` → 3). Falls back to a
 * default page size when the binding references no indexed article.
 */
export function authorFeedSize(template: AuthorTemplate): number {
  let maxIndex = -1;
  for (const { source } of authorBinding(template, "author-feed")) {
    const match = source.match(/^data\.(\d+)\./);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }
  return maxIndex >= 0 ? maxIndex + 1 : AUTHOR_PAGE_SIZE;
}

/** Static fallback feed rows stored on the template (media flattened to URLs). */
function staticFeed(template: AuthorTemplate): SectionFeedArticle[] {
  const slot = organismDefault(template, "author_feed").feed_articles as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (slot?.dynamic_fields ?? []).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
}

/**
 * Resolve the author's article feed strictly from the `author-feed` binding:
 * each bound `data.N` index becomes one card, in index order, with that index's
 * mapped fields. So the page renders exactly as many articles as the template
 * binds — no more — exactly like the section feed. Falls back to the template's
 * static rows when the author returned no articles.
 */
export function buildAuthorFeedItems(
  template: AuthorTemplate,
  posts: AuthorPostsResponse
): SectionFeedArticle[] {
  const fieldMap = authorBinding(template, "author-feed");
  const live = resolveBoundItems(fieldMap, posts).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
  return live.length > 0 ? live : staticFeed(template);
}
