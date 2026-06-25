import { flattenMediaFields } from "@/lib/media";
import { isBlank } from "@/lib/value";
import type {
  CdsBinding,
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
} from "@/types/cds.types";

// Re-exported for backwards compatibility; canonical definition is in `@/lib/value`.
export { isBlank };

/** Returns the organism's first inline default block. */
export function firstDynamicField(node: CdsLayoutOrganism): Record<string, unknown> {
  return node.dynamic_fields?.[0] ?? {};
}

/** Returns the organism's binding id, falling back to schema_slug. */
export function organismId(node: CdsLayoutOrganism): string {
  return (firstDynamicField(node).id as string) || node.schema_slug;
}

/** Returns the field-map for a given organism id, or [] when none exists. */
export function bindingFor(template: CdsTemplate, id: string): CdsFieldMapEntry[] {
  const binding = template.bindings.dynamic_fields.find(
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
