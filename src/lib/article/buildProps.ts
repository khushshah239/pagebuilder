import { buildOrganismProps, feedSize, OrganismSpec, resolveBinding } from "@/lib/shared/buildProps";
import { organismId } from "@/lib/cds/organism";
import type { CdsArticleTemplate, CdsBinding, CdsLayoutOrganism } from "@/types/article/cds.types";

const ARTICLE_ORGANISM_SPECS: Record<string, OrganismSpec> = {
  articlehero:           { kind: "single" },
  articleheader:         { kind: "single" },
  articlebody:           { kind: "single" },
  inlinevideoembed:      { kind: "single" },
  articlesummary:        { kind: "static" },
  sharebar:              { kind: "static" },
  articlefooter:         { kind: "static" },
  relatedarticlesrow:    { kind: "list", itemsProp: "related_cards",   defaultHeading: "Related Articles" },
  morefromauthorrow:     { kind: "list", itemsProp: "author_articles", defaultHeading: "More from the author" },
  tagsrow:               { kind: "list", itemsProp: "article_tags" },
  trendingarticlesrow:   { kind: "list", itemsProp: "trending_cards",  defaultHeading: "Trending Now" },
  liveblogfeed:          { kind: "list", itemsProp: "live_updates" },
  live_blog:             { kind: "list", itemsProp: "live_updates" },
  "sidebar-latest-news": { kind: "list", itemsProp: "items",           defaultHeading: "Latest News" },
};

function getBinding(template: CdsArticleTemplate, id: string) {
  return resolveBinding(
    (template.data_binding?.dynamic_fields ?? []) as CdsBinding[],
    id
  );
}

export function articleFeedSize(
  template: CdsArticleTemplate,
  schemaSlug: string,
  fallback: number
): number {
  return feedSize(getBinding(template, schemaSlug), fallback);
}

export function buildArticleOrganismProps(
  node: CdsLayoutOrganism,
  template: CdsArticleTemplate,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const spec = ARTICLE_ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;
  return buildOrganismProps(node, spec, getBinding(template, organismId(node)), data);
}
