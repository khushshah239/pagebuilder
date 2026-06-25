import type { ComponentType } from "react";
import { buildArticleOrganismProps } from "@/lib/article/buildProps";
import { organismId } from "@/lib/cds/organism";
import { NoTemplateToast } from "@/components/NoTemplateToast";
import type {
  ArticleData,
  CdsArticleTemplate,
  CdsLayoutOrganism,
} from "@/types/article/cds.types";
import {
  ArticleBody,
  ArticleFooter,
  ArticleHeader,
  ArticleHero,
  ArticleSummary,
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
  articlesummary: ArticleSummary,
  articlebody: ArticleBody,
  inlinevideoembed: InlineVideoEmbed,
  sharebar: ShareBar,
  tagsrow: TagsRow,
  relatedarticlesrow: RelatedArticlesRow,
  morefromauthorrow: MoreFromAuthorRow,
  trendingarticlesrow: TrendingArticlesRow,
  liveblogfeed: LiveBlogFeed,
  live_blog: LiveBlogFeed,
  sidebarlatestnews: SidebarLatestNews,
  "sidebar-latest-news": SidebarLatestNews,
  articlefooter: ArticleFooter,
};

// Organisms whose slug starts with this prefix are rendered in the aside.
const SIDEBAR_SLUG_PREFIX = "sidebar";
function isSidebarOrganism(schemaSlug: string): boolean {
  return schemaSlug.startsWith(SIDEBAR_SLUG_PREFIX);
}

/** Returns true if a template key/value pair represents an organism node. */
function isOrganismNode(key: string, value: unknown): value is CdsLayoutOrganism {
  if (key === "data_binding" || !value || typeof value !== "object") return false;
  const node = value as Partial<CdsLayoutOrganism>;
  return typeof node.schema_slug === "string" && Array.isArray(node.dynamic_fields);
}

/** Renders article organisms in template key order, filtered by `include`. */
function renderOrganisms(
  data: ArticleData,
  include: (schemaSlug: string) => boolean
) {
  const customEntity = data.custom_entity ?? {};
  const template = customEntity.template?.[0] as CdsArticleTemplate | undefined;
  if (!template) return null;

  // Merge post fields + custom_entity so bindings resolve against either.
  const root: Record<string, unknown> = { ...data, ...customEntity };

  return Object.entries(template)
    .filter(([key, value]) => isOrganismNode(key, value))
    .map(([key, value], index) => {
      const node = value as CdsLayoutOrganism;
      if (!include(node.schema_slug)) return null;

      const Component = ARTICLE_ORGANISM_COMPONENTS[node.schema_slug];
      if (!Component) return null;

      const props = buildArticleOrganismProps(node, template, root);
      if (!props) return null;

      return <Component key={organismId(node) || key || index} {...props} />;
    });
}

/** Renders the main article column (non-sidebar organisms). */
export function ArticleRenderer({ data }: { data: ArticleData }) {
  const hasTemplate = !!data.custom_entity?.template?.[0];
  return (
    <>
      {!hasTemplate && <NoTemplateToast />}
      {renderOrganisms(data, (slug) => !isSidebarOrganism(slug))}
    </>
  );
}

/** Renders only sidebar* organisms for the right column. */
export function ArticleSidebar({ data }: { data: ArticleData }) {
  return <>{renderOrganisms(data, isSidebarOrganism)}</>;
}
