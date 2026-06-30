import { buildOrganismProps, feedSize, OrganismSpec, resolveBinding } from "@/lib/shared/buildProps";
import { organismId } from "@/lib/cds/organism";
import type { CdsArticleTemplate, CdsBinding, CdsFieldMapEntry, CdsLayoutOrganism } from "@/types/article/cds.types";

const ARTICLE_ORGANISM_SPECS: Record<string, OrganismSpec> = {
  articlehero:           { kind: "single" },
  articleheader:         { kind: "single" },
  articlebody:           { kind: "single" },
  inlinevideoembed:      { kind: "single" },
  sharebar:              { kind: "static" },
  relatedarticlesrow:    { kind: "list", itemsProp: "related_cards",   defaultSlot: "related_article" },
  morefromauthorrow:     { kind: "list", itemsProp: "author_articles", defaultSlot: "author_cards" },
  tagsrow:               { kind: "list", itemsProp: "article_tags",    defaultSlot: "article_tags" },
  trendingarticlesrow:   { kind: "list", itemsProp: "trending_cards",  defaultSlot: "trending_card" },
  live_blog:             { kind: "list", itemsProp: "live_updates",    defaultSlot: null },
  "sidebar-latest-news": { kind: "list", itemsProp: "items",           defaultSlot: "sidebar_coloumn_card" },
};

function getBinding(template: CdsArticleTemplate, id: string) {
  return resolveBinding(
    (template.data_binding?.dynamic_fields ?? []) as CdsBinding[],
    id
  );
}

/** Finds an organism node by schema_slug and returns its own id (bindings are keyed by id, not slug). */
function organismIdForSlug(template: CdsArticleTemplate, schemaSlug: string): string {
  for (const value of Object.values(template)) {
    if (!value || typeof value !== "object") continue;
    const node = value as Partial<CdsLayoutOrganism>;
    if (node.schema_slug === schemaSlug) return organismId(node as CdsLayoutOrganism);
  }
  return "";
}

export function articleFeedSize(
  template: CdsArticleTemplate,
  schemaSlug: string,
  fallback: number
): number {
  return feedSize(getBinding(template, organismIdForSlug(template, schemaSlug)), fallback);
}

/** Root custom_entity field a list organism's binding reads from (e.g. "related_article"). */
export function articleBindingRootField(
  template: CdsArticleTemplate,
  schemaSlug: string
): string {
  const orgId = organismIdForSlug(template, schemaSlug);
  const first = getBinding(template, orgId)[0] as CdsFieldMapEntry | undefined;
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
