import { buildOrganismProps, feedSize, OrganismSpec, resolveBinding } from "@/lib/shared/buildProps";
import { organismId } from "@/lib/cds/organism";
import type { CdsArticleTemplate, CdsBinding, CdsFieldMapEntry, CdsLayoutOrganism } from "@/types/article/cds.types";

const ARTICLE_ORGANISM_SPECS: Record<string, OrganismSpec> = {
  articlehero:           { kind: "single" },
  articleheader:         { kind: "single" },
  articlebody:           { kind: "single" },
  inlinevideoembed:      { kind: "single" },
  articlesummary:        { kind: "static" },
  sharebar:              { kind: "static" },
  relatedarticlesrow:    { kind: "list", itemsProp: "related_cards" },
  morefromauthorrow:     { kind: "list", itemsProp: "author_articles" },
  tagsrow:               { kind: "list", itemsProp: "article_tags" },
  trendingarticlesrow:   { kind: "list", itemsProp: "trending_cards" },
  live_blog:             { kind: "list", itemsProp: "live_updates" },
  "sidebar-latest-news": { kind: "list", itemsProp: "items" },
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

/** Root custom_entity field a list organism's binding reads from (e.g.
 *  "related_article.results.0.title" → "related_article"). Falls back to ""
 *  when the organism has no binding, so callers can supply their own default. */
export function articleBindingRootField(
  template: CdsArticleTemplate,
  schemaSlug: string
): string {
  const first = getBinding(template, schemaSlug)[0] as CdsFieldMapEntry | undefined;
  return first?.source.split(".")[0] ?? "";
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
