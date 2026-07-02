import type { ComponentType } from "react";
import { buildArticleOrganismProps } from "@/lib/article/buildProps";
import { organismId, organismLayout } from "@/lib/cds/organism";
import { NoTemplateToast } from "@/components/NoTemplateToast";
import type {
  ArticleData,
  CdsArticleTemplate,
} from "@/types/article/cds.types";
import {
  ArticleBody,
  ArticleHeader,
  ArticleHero,
  InlineVideoEmbed,
  LiveBlogFeed,
  MoreFromAuthorRow,
  RelatedArticlesRow,
  ShareBar,
  SidebarLatestNews,
  TagsRow,
  TrendingArticlesRow,
} from "@/organisms/article";

// ComponentType<any>: prop types are enforced per-organism, not at this dispatch boundary.
const ARTICLE_ORGANISM_COMPONENTS: Record<string, ComponentType<any>> = {
  articlehero: ArticleHero,
  articleheader: ArticleHeader,
  articlebody: ArticleBody,
  inlinevideoembed: InlineVideoEmbed,
  sharebar: ShareBar,
  tagsrow: TagsRow,
  relatedarticlesrow: RelatedArticlesRow,
  morefromauthorrow: MoreFromAuthorRow,
  trendingarticlesrow: TrendingArticlesRow,
  live_blog: LiveBlogFeed,
  "sidebar-latest-news": SidebarLatestNews,
};

// Organisms whose slug starts with this prefix are rendered in the aside.
const SIDEBAR_SLUG_PREFIX = "sidebar";
// Organisms always rendered in the aside regardless of slug naming (live blog
// reads better narrow — full-width images there end up oversized).
const FORCED_SIDEBAR_SLUGS = new Set(["live_blog"]);
function isSidebarOrganism(schemaSlug: string): boolean {
  return schemaSlug.startsWith(SIDEBAR_SLUG_PREFIX) || FORCED_SIDEBAR_SLUGS.has(schemaSlug);
}

function renderOrganisms(
  data: ArticleData,
  include: (schemaSlug: string) => boolean
) {
  const customEntity = data.custom_entity ?? {};
  const template = customEntity.template?.[0] as CdsArticleTemplate | undefined;
  if (!template) return null;

  // Merge post fields + custom_entity so bindings resolve against either.
  const root: Record<string, unknown> = { ...data, ...customEntity };

  return organismLayout(template)
    .filter((node) => include(node.schema_slug))
    .map((node, index) => {
      const Component = ARTICLE_ORGANISM_COMPONENTS[node.schema_slug];
      if (!Component) return null;

      const props = buildArticleOrganismProps(node, template, root);
      if (!props) return null;

      return <Component key={organismId(node) || index} {...props} />;
    });
}

export function ArticleRenderer({ data }: { data: ArticleData }) {
  const hasTemplate = !!data.custom_entity?.template?.[0];
  return (
    <>
      {!hasTemplate && <NoTemplateToast />}
      {renderOrganisms(data, (slug) => !isSidebarOrganism(slug))}
    </>
  );
}

export function ArticleSidebar({ data }: { data: ArticleData }) {
  return <>{renderOrganisms(data, isSidebarOrganism)}</>;
}
