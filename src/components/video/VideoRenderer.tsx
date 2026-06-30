import type { ComponentType } from "react";
import { buildVideoOrganismProps } from "@/lib/video/buildProps";
import { excludeCurrentArticle } from "@/lib/article/excludeCurrent";
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

const VIDEO_ORGANISM_COMPONENTS: Record<string, ComponentType<any>> = {
  videohero: VideoHero,
  videoheader: VideoHeader,
  videobody: ArticleBody,
  tagsrow: TagsRow,
  morefromauthorrow: MoreFromAuthorRow,
  relatedarticlesrow: RelatedArticlesRow,
  "sidebar-latest-news": SidebarLatestNews,
};

// Organisms whose slug starts with this prefix are rendered in the aside.
const SIDEBAR_SLUG_PREFIX = "sidebar";
function isSidebarOrganism(schemaSlug: string): boolean {
  return schemaSlug.startsWith(SIDEBAR_SLUG_PREFIX);
}

function isOrganismNode(key: string, value: unknown): value is CdsLayoutOrganism {
  if (key === "data_binding" || key === "data_bindings" || !value || typeof value !== "object") return false;
  const node = value as Partial<CdsLayoutOrganism>;
  return typeof node.schema_slug === "string" && Array.isArray(node.dynamic_fields);
}

function renderOrganisms(
  data: ArticleData,
  template: Record<string, unknown>,
  include: (schemaSlug: string) => boolean
) {
  // Merge post fields + custom_entity so bindings resolve against either.
  const root: Record<string, unknown> = { ...data, ...(data.custom_entity ?? {}) };

  return Object.entries(template)
    .filter(([key, value]) => isOrganismNode(key, value))
    .map(([key, value], index) => {
      const node = value as CdsLayoutOrganism;
      if (!include(node.schema_slug)) return null;

      const Component = VIDEO_ORGANISM_COMPONENTS[node.schema_slug];
      if (!Component) return null;

      let props = buildVideoOrganismProps(node, template, root);
      if (!props) return null;
      // Never let the current video list itself in related / more-from-author / trending.
      props = excludeCurrentArticle(node.schema_slug, props, [
        data.legacy_url as string | undefined,
        data.absolute_url as string | undefined,
      ]);

      return <Component key={organismId(node) || key || index} {...props} />;
    });
}

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
