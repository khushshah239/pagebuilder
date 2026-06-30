import type { ComponentType } from "react";
import { buildVideoOrganismProps } from "@/lib/video/buildProps";
import { organismId, organismLayout } from "@/lib/cds/organism";
import { NoTemplateToast } from "@/components/NoTemplateToast";
import type { ArticleData } from "@/types/article/cds.types";
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

function renderOrganisms(
  data: ArticleData,
  template: Record<string, unknown>,
  include: (schemaSlug: string) => boolean
) {
  // Merge post fields + custom_entity so bindings resolve against either.
  const root: Record<string, unknown> = { ...data, ...(data.custom_entity ?? {}) };

  return organismLayout(template)
    .filter((node) => include(node.schema_slug))
    .map((node, index) => {
      const Component = VIDEO_ORGANISM_COMPONENTS[node.schema_slug];
      if (!Component) return null;

      const props = buildVideoOrganismProps(node, template, root);
      if (!props) return null;

      return <Component key={organismId(node) || index} {...props} />;
    });
}

export function VideoRenderer({
  data,
  template,
}: {
  data: ArticleData;
  template: Record<string, unknown>;
}) {
  const hasTemplate = organismLayout(template).length > 0;
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
  if (organismLayout(template).length === 0) return null;
  return <>{renderOrganisms(data, template, isSidebarOrganism)}</>;
}
