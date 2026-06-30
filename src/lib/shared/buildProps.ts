import { resolveBoundItems } from "@/lib/bindings";
import { defaultItems, firstDynamicField, headingFromId, isBlank, organismId } from "@/lib/cds/organism";
import { MEDIA_KEYS, flattenMedia, flattenMediaFields } from "@/lib/media";
import { getByPath } from "@/lib/path";
import type { CdsFieldMapEntry, CdsLayoutOrganism } from "@/types/article/cds.types";

export type OrganismSpec =
  | { kind: "single" }
  | { kind: "static" }
  | { kind: "list"; itemsProp: string; defaultSlot: string | null };

function coerce(key: string, value: unknown): unknown {
  return MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
}

function defaultProps(node: CdsLayoutOrganism): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(firstDynamicField(node))) {
    if (key === "id") continue;
    out[key] = coerce(key, value);
  }
  return out;
}

/** Looks up a binding entry by organism id. */
export function resolveBinding(
  entries: Array<{ organism_id: string; field_map: { dynamic_fields: CdsFieldMapEntry[] } }>,
  id: string
): CdsFieldMapEntry[] {
  const entry = entries.find((b) => b.organism_id === id);
  return entry?.field_map.dynamic_fields ?? [];
}


/** Returns max bound index + 1 from a field map, or fallback when unconfigured. */
export function feedSize(fieldMap: CdsFieldMapEntry[], fallback: number): number {
  let max = -1;
  for (const { source } of fieldMap) {
    const m = source.match(/\.(\d+)(?:\.|$)/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max >= 0 ? max + 1 : fallback;
}

/** Builds props for one organism from its spec, resolved binding, and live data. */
export function buildOrganismProps(
  node: CdsLayoutOrganism,
  spec: OrganismSpec,
  fieldMap: CdsFieldMapEntry[],
  data: Record<string, unknown>
): Record<string, unknown> {
  const id = organismId(node);

  if (spec.kind === "static") {
    const props: Record<string, unknown> = { identifier: id };
    for (const [key, value] of Object.entries(firstDynamicField(node))) {
      if (key === "id") continue;
      const container = value as { dynamic_fields?: Record<string, unknown>[] };
      props[key] = Array.isArray(container?.dynamic_fields)
        ? container.dynamic_fields.map(flattenMediaFields)
        : coerce(key, value);
    }
    return props;
  }

  if (spec.kind === "single") {
    const props: Record<string, unknown> = { identifier: id, ...defaultProps(node) };
    for (const { source, target } of fieldMap) {
      const live = getByPath(data, source);
      if (!isBlank(live)) props[target] = coerce(target, live);
    }
    return props;
  }

  // list: live binding items → template inline defaults as fallback.
  const liveItems = resolveBoundItems(fieldMap, data).map(flattenMediaFields);
  const items = liveItems.length > 0 ? liveItems : defaultItems(node, spec.defaultSlot);
  const result: Record<string, unknown> = {
    identifier: id,
    [spec.itemsProp]: items,
    // heading is derived from the organism id (e.g. "related-articles" → "Related Articles").
    heading: headingFromId(id),
  };
  for (const [key, val] of Object.entries(firstDynamicField(node))) {
    if (key === "id" || key in result) continue;
    const container = val as { dynamic_fields?: unknown[] };
    if (Array.isArray(container?.dynamic_fields)) continue;
    result[key] = coerce(key, val);
  }
  return result;
}