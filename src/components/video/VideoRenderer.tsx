import type { ComponentType } from "react";
import { buildVideoOrganismProps } from "@/lib/video/buildProps";
import { organismId } from "@/lib/cds/organism";
import { NoTemplateToast } from "@/components/NoTemplateToast";
import type { ArticleData, CdsLayoutOrganism } from "@/types/article/cds.types";
import { VideoHero, VideoHeader } from "@/organisms/video";
import {
  ArticleBody,
  TagsRow,
  RelatedArticlesRow,
  MoreFromAuthorRow,
  SidebarLatestNews,
} from "@/organisms/article";

/**
 * Maps a video template organism `schema_slug` to its presentational component.
 * The shared template at `/videotemplates/videotemplate` carries `schema_slug` on
 * each organism node (same convention as article templates).
 */
const VIDEO_ORGANISM_COMPONENTS: Record<string, ComponentType<any>> = {
  videohero: VideoHero,
  videoheader: VideoHeader,
  videobody: ArticleBody,
  tagsrow: TagsRow,
  morefromauthorrow: MoreFromAuthorRow,
  relatedarticlesrow: RelatedArticlesRow,
  "sidebar-latest-news": SidebarLatestNews,
};

/**
 * Naming convention: any organism whose `schema_slug` starts with this prefix is
 * right-column content, regardless of where it sits in the template key order.
 */
const SIDEBAR_SLUG_PREFIX = "sidebar";

/**
 * Organisms whose `schema_slug` marks them as right-column content. They are
 * rendered in the page's `<aside>` (via `VideoSidebar`) instead of the main
 * video flow, so a template can place a sidebar widget anywhere in its key
 * order and it still lands in the sidebar.
 */
function isSidebarOrganism(schemaSlug: string): boolean {
  return schemaSlug.startsWith(SIDEBAR_SLUG_PREFIX);
}

/** A template entry is an organism when it carries a `schema_slug` + slots. */
function isOrganismNode(key: string, value: unknown): value is CdsLayoutOrganism {
  if (key === "data_binding" || key === "data_bindings" || !value || typeof value !== "object") return false;
  const node = value as Partial<CdsLayoutOrganism>;
  return typeof node.schema_slug === "string" && Array.isArray(node.dynamic_fields);
}

/**
 * Walk the shared video template in its declared organism order and draw each
 * organism that `include` accepts, with props built from the live post data
 * (falling back to the template's inline defaults). Organisms with no matching
 * component or no resolvable props are skipped. No layout is hardcoded — the
 * template's own key order is the render order.
 */
function renderOrganisms(
  data: ArticleData,
  template: Record<string, unknown>,
  include: (schemaSlug: string) => boolean
) {
  // Bindings address both the post fields (`title`, `tags.*`) and the
  // collection slots under `custom_entity` (`more_from_author.results.*`), so
  // resolve against the two merged into one root.
  const root: Record<string, unknown> = { ...data, ...(data.custom_entity ?? {}) };

  return Object.entries(template)
    .filter(([key, value]) => isOrganismNode(key, value))
    .map(([key, value], index) => {
      const node = value as CdsLayoutOrganism;
      if (!include(node.schema_slug)) return null;

      const Component = VIDEO_ORGANISM_COMPONENTS[node.schema_slug];
      if (!Component) return null;

      const props = buildVideoOrganismProps(node, template, root);
      if (!props) return null;

      return <Component key={organismId(node) || key || index} {...props} />;
    });
}

/** Main video column — every organism except the sidebar ones. */
export function VideoRenderer({
  data,
  template,
}: {
  data: ArticleData;
  template: Record<string, unknown>;
}) {
  const hasTemplate = Object.entries(template).some(([k, v]) => isOrganismNode(k, v));
  return (
    <>
      {!hasTemplate && <NoTemplateToast />}
      {renderOrganisms(data, template, (slug) => !isSidebarOrganism(slug))}
    </>
  );
}

/** Right-column content — only the `sidebar*` organisms. */
export function VideoSidebar({
  data,
  template,
}: {
  data: ArticleData;
  template: Record<string, unknown>;
}) {
  if (!Object.entries(template).some(([k, v]) => isOrganismNode(k, v))) return null;
  return <>{renderOrganisms(data, template, isSidebarOrganism)}</>;
}
