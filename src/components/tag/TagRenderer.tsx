import type { ComponentType } from "react";
import { TagHeroBanner } from "@/organisms/tag/TagHeroBanner";
import { SectionHeroBanner } from "@/organisms/section/SectionHeroBanner";
import { SectionFeed } from "@/components/section/SectionFeed";
import { buildTagOrganismProps } from "@/lib/tag/buildProps";
import type { TagPostsResponse } from "@/api/tagApi";
import type { CdsLayoutOrganism } from "@/types/article/cds.types";

interface TagRendererProps {
  template: Record<string, unknown>;
  tag: Record<string, unknown>;
  posts: TagPostsResponse;
  page?: number;
}

/** Template keys that are metadata, not organism nodes. */
const NON_ORGANISM_KEYS = new Set([
  "id",
  "title",
  "name",
  "is_active",
  "data_binding",
  "data_bindings",
  "legacy_url",
  "absolute_url",
  "formatted_first_published_at_datetime",
  "formatted_last_published_at_datetime",
]);

function isOrganismNode(key: string, value: unknown): value is CdsLayoutOrganism {
  if (NON_ORGANISM_KEYS.has(key) || !value || typeof value !== "object") return false;
  const node = value as Partial<CdsLayoutOrganism>;
  return typeof node.schema_slug === "string" && Array.isArray(node.dynamic_fields);
}

/**
 * Maps every tag template organism `schema_slug` to its presentational component.
 * Supports both tag-specific slugs and section-template slugs (for reused templates).
 */
const TAG_ORGANISM_COMPONENTS: Record<string, ComponentType<any>> = {
  tag_hero: TagHeroBanner,
  taghero: TagHeroBanner,
  "tag-hero": TagHeroBanner,
  section_hero: SectionHeroBanner,
  sectionhero: SectionHeroBanner,
  "section-hero": SectionHeroBanner,
  tag_feed: SectionFeed,
  tagfeed: SectionFeed,
  "tag-feed": SectionFeed,
  section_feed: SectionFeed,
  sectionfeed: SectionFeed,
  "section-feed": SectionFeed,
};

/**
 * Render a tag page by walking every organism in the shared tag template and
 * building props from the tag binding — mirrors how VideoRenderer works so all
 * template organisms (not just the hardcoded hero + feed) actually render.
 */
export function TagRenderer({ template, tag, posts, page }: TagRendererProps) {
  return (
    <>
      {Object.entries(template)
        .filter(([key, value]) => isOrganismNode(key, value))
        .map(([key, value], index) => {
          const node = value as CdsLayoutOrganism;
          const Component = TAG_ORGANISM_COMPONENTS[node.schema_slug];
          if (!Component) return null;

          const props = buildTagOrganismProps(node, template, tag, posts);
          if (!props) return null;

          const id = (node.dynamic_fields?.[0]?.id as string) || key;
          const extraProps = node.schema_slug.includes("feed") ? { page } : {};
          return <Component key={id || index} {...(props as any)} {...extraProps} />;
        })}
    </>
  );
}
