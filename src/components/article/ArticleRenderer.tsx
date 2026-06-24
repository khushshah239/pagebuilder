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

/**
 * Maps a CDS `schema_slug` to its presentational article organism. The resolver
 * builds props dynamically (a `Record<string, unknown>` shaped to each
 * organism's contract), so the map is typed with `ComponentType<any>`: the
 * compile-time prop type per organism is enforced where each is defined, not at
 * this dynamic dispatch boundary.
 */
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

/**
 * Naming convention: any organism whose `schema_slug` starts with this prefix is
 * right-column content, regardless of where it sits in the template key order.
 */
const SIDEBAR_SLUG_PREFIX = "sidebar";

/**
 * Organisms whose `schema_slug` marks them as right-column content. They are
 * rendered in the page's `<aside>` (via `ArticleSidebar`) instead of the main
 * article flow, so a template can place a sidebar widget anywhere in its key
 * order and it still lands in the sidebar.
 */
function isSidebarOrganism(schemaSlug: string): boolean {
  return schemaSlug.startsWith(SIDEBAR_SLUG_PREFIX);
}

/** A template entry is an organism when it carries a `schema_slug` + slots. */
function isOrganismNode(key: string, value: unknown): value is CdsLayoutOrganism {
  if (key === "data_binding" || !value || typeof value !== "object") return false;
  const node = value as Partial<CdsLayoutOrganism>;
  return typeof node.schema_slug === "string" && Array.isArray(node.dynamic_fields);
}

/**
 * Walk the selected article template (T1/T2/T3) in its declared organism order
 * and draw each organism that `include` accepts, with props built from the live
 * post data (falling back to the template's inline defaults). Organisms with no
 * matching component or no resolvable props are skipped. No layout is hardcoded
 * — the template's own key order is the render order.
 */
function renderOrganisms(
  data: ArticleData,
  include: (schemaSlug: string) => boolean
) {
  const customEntity = data.custom_entity ?? {};
  const template = customEntity.template?.[0] as CdsArticleTemplate | undefined;
  if (!template) return null;

  // Bindings address both the post fields (`summary`, `tags.*`) and the
  // collection slots under `custom_entity` (`related_article.results.*`), so
  // resolve against the two merged into one root.
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

/** Main article column — every organism except the sidebar ones. */
export function ArticleRenderer({ data }: { data: ArticleData }) {
  const hasTemplate = !!data.custom_entity?.template?.[0];
  return (
    <>
      {!hasTemplate && <NoTemplateToast />}
      {renderOrganisms(data, (slug) => !isSidebarOrganism(slug))}
    </>
  );
}

/** Right-column content — only the `sidebar*` organisms. */
export function ArticleSidebar({ data }: { data: ArticleData }) {
  return <>{renderOrganisms(data, isSidebarOrganism)}</>;
}
