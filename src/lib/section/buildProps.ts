import { getByPath } from "@/lib/path";
import { isBlank } from "@/lib/value";
import { flattenMediaFields } from "@/lib/media";
import { resolveBoundItems } from "@/lib/bindings";
import { SECTION_PAGE_SIZE } from "@/config/cds";
import type {
  SectionFeedArticle,
  SectionHeroBannerProps,
} from "@/types/section/organism.types";
import type { CategoryInfo, CategoryPostsResponse } from "@/api/sectionApi";

type FieldMapEntry = { source: string; target: string };
type SectionTemplate = Record<string, unknown>;

interface SectionBinding {
  organism_id: string;
  field_map: { dynamic_fields: FieldMapEntry[] };
}

/** Returns the field-map for one section organism. */
function sectionBinding(
  template: SectionTemplate,
  organismId: string
): FieldMapEntry[] {
  const binding = template.data_binding as
    | { dynamic_fields?: SectionBinding[] }
    | undefined;
  const entry = binding?.dynamic_fields?.find(
    (candidate) => candidate.organism_id === organismId
  );
  return entry?.field_map.dynamic_fields ?? [];
}

/** Returns an organism's first inline default block. */
function organismDefault(
  template: SectionTemplate,
  key: string
): Record<string, unknown> {
  const node = template[key] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return node?.dynamic_fields?.[0] ?? {};
}

// Uses max index (not count) so gaps in binding indices still fetch enough articles.
export function sectionFeedSize(template: SectionTemplate): number {
  let maxIndex = -1;
  for (const { source } of sectionBinding(template, "section-feed")) {
    const match = source.match(/^data\.(\d+)\./);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }
  return maxIndex >= 0 ? maxIndex + 1 : SECTION_PAGE_SIZE;
}

/** Returns static fallback feed rows from the template. */
function staticFeed(template: SectionTemplate): SectionFeedArticle[] {
  const slot = organismDefault(template, "section_feed").feed_articles as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (slot?.dynamic_fields ?? []).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
}

/** Builds section feed from live binding, falling back to template static rows. */
export function buildSectionFeedItems(
  template: SectionTemplate,
  posts: CategoryPostsResponse
): SectionFeedArticle[] {
  const fieldMap = sectionBinding(template, "section-feed");
  const live = resolveBoundItems(fieldMap, posts).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
  return live.length > 0 ? live : staticFeed(template);
}

/** Builds section hero props from binding context (includes live category.name). */
export function buildSectionHeroProps(
  template: SectionTemplate,
  posts: CategoryPostsResponse,
  category?: CategoryInfo | null
): SectionHeroBannerProps {
  const props: Record<string, unknown> = { identifier: "section-hero" };

  for (const [key, value] of Object.entries(organismDefault(template, "section_hero"))) {
    if (key !== "id") props[key] = value;
  }

  // Merge category into context so `category.name` resolves from the binding.
  const context = { ...posts, category: category ?? {} };

  for (const { source, target } of sectionBinding(template, "section-hero")) {
    const live = getByPath(context, source);
    if (!isBlank(live)) props[target] = live;
  }

  return props as unknown as SectionHeroBannerProps;
}
