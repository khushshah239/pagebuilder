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

/**
 * Resolve SectionPage organism props from the shared template + a page of
 * category articles. The template's `data_binding` defines how article fields
 * map onto each organism's slots; bindings address the posts response, so source
 * paths look like `data.0.title`.
 */

type FieldMapEntry = { source: string; target: string };
type SectionTemplate = Record<string, unknown>;

interface SectionBinding {
  organism_id: string;
  field_map: { dynamic_fields: FieldMapEntry[] };
}

/** The field-map for one section organism from the template's `data_binding`. */
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

/** An organism's inline default block (its static fallback content). */
function organismDefault(
  template: SectionTemplate,
  key: string
): Record<string, unknown> {
  const node = template[key] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return node?.dynamic_fields?.[0] ?? {};
}

/**
 * How many category articles to fetch for the feed: one past the HIGHEST `data.N`
 * index the binding references. Using the max index (not the count) means a
 * binding with a gap (e.g. `data.7` missing) still fetches enough articles for
 * every bound slot — `data.10` needs 11 articles even if only 10 are mapped.
 */
export function sectionFeedSize(template: SectionTemplate): number {
  let maxIndex = -1;
  for (const { source } of sectionBinding(template, "section-feed")) {
    const match = source.match(/^data\.(\d+)\./);
    if (match) maxIndex = Math.max(maxIndex, Number(match[1]));
  }
  return maxIndex >= 0 ? maxIndex + 1 : SECTION_PAGE_SIZE;
}

/** Static fallback feed rows stored on the template (media flattened to URLs). */
function staticFeed(template: SectionTemplate): SectionFeedArticle[] {
  const slot = organismDefault(template, "section_feed").feed_articles as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (slot?.dynamic_fields ?? []).map(
    (item) => flattenMediaFields(item) as unknown as SectionFeedArticle
  );
}

/**
 * Resolve the category feed strictly from the `section-feed` binding: each bound
 * `data.N` index becomes one card (in index order), with that index's mapped
 * fields. So the page renders exactly as many cards as the editor bound — no
 * more. Falls back to the template's static rows when the category returned no
 * articles.
 */
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

/**
 * Resolve the section hero: scalar slots filled from the binding context
 * (which includes `category.name` from the live API), with the template's
 * inline defaults (e.g. `heading`) as fallback.
 */
export function buildSectionHeroProps(
  template: SectionTemplate,
  posts: CategoryPostsResponse,
  category?: CategoryInfo | null
): SectionHeroBannerProps {
  const props: Record<string, unknown> = { identifier: "section-hero" };

  for (const [key, value] of Object.entries(organismDefault(template, "section_hero"))) {
    if (key !== "id") props[key] = value;
  }

  // Merge category alongside posts so bindings like `category.name` resolve.
  const context = { ...posts, category: category ?? {} };

  for (const { source, target } of sectionBinding(template, "section-hero")) {
    const live = getByPath(context, source);
    if (!isBlank(live)) props[target] = live;
  }

  return props as unknown as SectionHeroBannerProps;
}
