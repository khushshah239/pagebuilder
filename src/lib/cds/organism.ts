import { flattenMediaFields } from "@/lib/media";
import { isBlank } from "@/lib/value";
import type {
  CdsBinding,
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
} from "@/types/cds.types";

export { isBlank };

/** Returns the organism's first inline default block. */
export function firstDynamicField(node: CdsLayoutOrganism): Record<string, unknown> {
  return node.dynamic_fields?.[0] ?? {};
}

/** Returns the organism's binding id, falling back to schema_slug. */
export function organismId(node: CdsLayoutOrganism): string {
  return String(firstDynamicField(node).id ?? "") || node.schema_slug;
}

/** Extracts the organism nodes out of a flat template object, in declared order
 *  (article/video templates store organisms as object keys, unlike the homepage
 *  template's `layout` array — this gives both the same array shape to render from). */
export function organismLayout(template: Record<string, unknown>): CdsLayoutOrganism[] {
  return Object.values(template).filter((value): value is CdsLayoutOrganism => {
    if (!value || typeof value !== "object") return false;
    const node = value as Partial<CdsLayoutOrganism>;
    return typeof node.schema_slug === "string" && Array.isArray(node.dynamic_fields);
  });
}

// Zone prefixes used to place an organism (see HomepageRenderer) — stripped so
// the heading reads cleanly (e.g. "right-top-stories" → "Top Stories").
const ZONE_PREFIX = /^(right|left|main|full|sidebar)-/;

/** Derives a display heading from an organism's id by stripping any zone prefix
 *  and humanizing the kebab/snake-case remainder, e.g.:
 *  "sports-row" → "Sports Row", "more-from-author" → "More From Author",
 *  "right-top-stories" → "Top Stories", "sidebar-latest-news" → "Latest News". */
export function headingFromId(id: string): string {
  return id
    .replace(ZONE_PREFIX, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Returns the field-map for a given organism id, or [] when none exists. */
export function bindingFor(template: CdsTemplate, id: string): CdsFieldMapEntry[] {
  const binding = (template.bindings?.dynamic_fields ?? []).find(
    (entry: CdsBinding) => entry.organism_id === id
  );
  return binding?.field_map.dynamic_fields ?? [];
}

/** Returns template default items for a list organism's fallback slot (media flattened). */
export function defaultItems(
  node: CdsLayoutOrganism,
  slot: string | null
): Record<string, unknown>[] {
  if (!slot) return [];
  const container = firstDynamicField(node)[slot] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return (container?.dynamic_fields ?? []).map(flattenMediaFields);
}
