import { buildOrganismProps, feedSize, OrganismSpec, resolveBinding } from "@/lib/shared/buildProps";
import { organismId } from "@/lib/cds/organism";
import type { CdsBinding, CdsFieldMapEntry, CdsLayoutOrganism } from "@/types/article/cds.types";

const VIDEO_ORGANISM_SPECS: Record<string, OrganismSpec> = {
  videohero:             { kind: "single" },
  videoheader:           { kind: "single" },
  videobody:             { kind: "single" },
  tagsrow:               { kind: "list", itemsProp: "article_tags" },
  morefromauthorrow:     { kind: "list", itemsProp: "author_articles" },
  relatedarticlesrow:    { kind: "list", itemsProp: "related_cards" },
  "sidebar-latest-news": { kind: "list", itemsProp: "items" },
};

function getBinding(template: Record<string, unknown>, id: string) {
  const block = (template.data_bindings ?? template.data_binding) as
    | { dynamic_fields?: CdsBinding[] }
    | undefined;
  return resolveBinding(block?.dynamic_fields ?? [], id);
}

export function videoBindingRootField(
  template: Record<string, unknown>,
  schemaSlug: string
): string {
  const first = getBinding(template, schemaSlug)[0] as CdsFieldMapEntry | undefined;
  return first?.source.split(".")[0] ?? "";
}

export function videoFeedSize(
  template: Record<string, unknown>,
  schemaSlug: string,
  fallback: number
): number {
  return feedSize(getBinding(template, schemaSlug), fallback);
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
