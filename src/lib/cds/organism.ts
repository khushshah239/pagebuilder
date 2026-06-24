/**
 * Generic CDS organism helpers shared by every page's prop-builder (homepage,
 * article, …). These are page-agnostic: they read an organism's inline template
 * defaults, locate its binding, and derive its stable id — none of which depend
 * on a specific page entity. Page-specific logic (e.g. the homepage's data-slot
 * heading lookup) stays in that page's own builder.
 */
import { flattenMediaFields } from "@/lib/media";
import { isBlank } from "@/lib/value";
import type {
  CdsBinding,
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
} from "@/types/cds.types";

// Re-exported so existing importers can keep getting `isBlank` from here; the
// single definition now lives in `@/lib/value`.
export { isBlank };

/** The organism's first inline default block (its template-stored fallback). */
export function firstDynamicField(node: CdsLayoutOrganism): Record<string, unknown> {
  return node.dynamic_fields?.[0] ?? {};
}

/** The organism's id (= `organism_id` used by bindings), falling back to slug. */
export function organismId(node: CdsLayoutOrganism): string {
  return (firstDynamicField(node).id as string) || node.schema_slug;
}

/** The field-map for an organism id, or an empty list when it has no binding. */
export function bindingFor(template: CdsTemplate, id: string): CdsFieldMapEntry[] {
  const binding = template.bindings.dynamic_fields.find(
    (entry: CdsBinding) => entry.organism_id === id
  );
  return binding?.field_map.dynamic_fields ?? [];
}

/**
 * Template-default items for a list organism's fallback slot (media flattened to
 * URL strings). Returns `[]` when the organism declares no fallback slot.
 */
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
