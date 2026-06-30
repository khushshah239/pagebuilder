import { buildOrganismProps, feedSize, OrganismSpec, resolveBinding } from "@/lib/shared/buildProps";
import { organismId } from "@/lib/cds/organism";
import type { CdsBinding, CdsFieldMapEntry, CdsLayoutOrganism } from "@/types/article/cds.types";

const VIDEO_ORGANISM_SPECS: Record<string, OrganismSpec> = {
  videohero:             { kind: "single" },
  videoheader:           { kind: "single" },
  videobody:             { kind: "single" },
  tagsrow:               { kind: "list", itemsProp: "article_tags",    defaultSlot: "article_tags" },
  morefromauthorrow:     { kind: "list", itemsProp: "author_articles", defaultSlot: "author_cards" },
  relatedarticlesrow:    { kind: "list", itemsProp: "related_cards",   defaultSlot: "related_article" },
  "sidebar-latest-news": { kind: "list", itemsProp: "items",           defaultSlot: "sidebar_coloumn_card" },
};

function getBinding(template: Record<string, unknown>, id: string) {
  const block = (template.data_bindings ?? template.data_binding) as
    | { dynamic_fields?: CdsBinding[] }
    | undefined;
  return resolveBinding(block?.dynamic_fields ?? [], id);
}

/** Finds an organism node by schema_slug and returns its own id (bindings are keyed by id, not slug). */
function organismIdForSlug(template: Record<string, unknown>, schemaSlug: string): string {
  for (const value of Object.values(template)) {
    if (!value || typeof value !== "object") continue;
    const node = value as Partial<CdsLayoutOrganism>;
    if (node.schema_slug === schemaSlug) return organismId(node as CdsLayoutOrganism);
  }
  return "";
}

export function videoBindingRootField(
  template: Record<string, unknown>,
  schemaSlug: string
): string {
  const orgId = organismIdForSlug(template, schemaSlug);
  const first = getBinding(template, orgId)[0] as CdsFieldMapEntry | undefined;
  return first?.source.split(".")[0] ?? "";
}

export function videoFeedSize(
  template: Record<string, unknown>,
  schemaSlug: string,
  fallback: number
): number {
  return feedSize(getBinding(template, organismIdForSlug(template, schemaSlug)), fallback);
}

export function buildVideoOrganismProps(
  node: CdsLayoutOrganism,
  template: Record<string, unknown>,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  const spec = VIDEO_ORGANISM_SPECS[node.schema_slug];
  if (!spec) return null;
  return buildOrganismProps(node, spec, getBinding(template, organismId(node)), data);
}
