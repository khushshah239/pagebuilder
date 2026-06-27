import { getByPath } from "@/lib/path";
import { isBlank } from "@/lib/value";
import { flattenMediaFields } from "@/lib/media";
import { resolveBoundItems } from "@/lib/bindings";
import { AUTHOR_PAGE_SIZE } from "@/config/cds";
import type { AuthorProfileHeaderProps } from "@/types/author/organism.types";
import type { SectionFeedArticle } from "@/types/section/organism.types";
import type { AuthorPostsResponse } from "@/api/authorApi";

type FieldMapEntry = { source: string; target: string };
type AuthorTemplate = Record<string, unknown>;

interface AuthorBinding {
  organism_id: string;
  field_map: { dynamic_fields: FieldMapEntry[] };
}

/** Returns the field-map for one author organism. Accepts `data_bindings` (plural) or `data_binding`. */
function authorBinding(
  template: AuthorTemplate,
  organismId: string
): FieldMapEntry[] {
  const binding = (template.data_bindings ?? template.data_binding) as
    | { dynamic_fields?: AuthorBinding[] }
    | undefined;
  const entry = binding?.dynamic_fields?.find(
    (candidate) => candidate.organism_id === organismId
  );
  return entry?.field_map.dynamic_fields ?? [];
}

/** Returns an organism's first inline default block. */
function organismDefault(
  template: AuthorTemplate,
  key: string
): Record<string, unknown> {
  const node = template[key] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return node?.dynamic_fields?.[0] ?? {};
}

// Uses max index (not count) so gaps in binding indices still fetch enough articles.
export function authorFeedSize(template: AuthorTemplate): number {
  let maxIndex = -1;
  for (const { source } of authorBinding(template, "author-feed")) {
    const match = source.match(/^data\.(\d+)\./);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }
  return maxIndex >= 0 ? maxIndex + 1 : AUTHOR_PAGE_SIZE;
}

/** Returns static fallback feed rows from the template. */
function staticFeed(template: AuthorTemplate): SectionFeedArticle[] {
  const slot = organismDefault(template, "author_feed").feed_articles as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (slot?.dynamic_fields ?? []).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
}

/** Builds author feed from live binding, falling back to template static rows. */
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

/** Builds author header props from binding context (includes live member profile). */
export function buildAuthorHeaderProps(
  template: AuthorTemplate,
  profile: Record<string, unknown>
): AuthorProfileHeaderProps {
  const props: Record<string, unknown> = { identifier: "author-header" };

  for (const [key, value] of Object.entries(organismDefault(template, "author_header"))) {
    if (key !== "id") props[key] = value;
  }

  // Merge profile into context so `member.name` resolves from the binding.
  const context = { member: profile ?? {} };

  for (const { source, target } of authorBinding(template, "author-header")) {
    const live = getByPath(context, source);
    if (!isBlank(live)) props[target] = live;
  }

  return props as unknown as AuthorProfileHeaderProps;
}
