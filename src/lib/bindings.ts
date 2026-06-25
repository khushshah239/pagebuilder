import { getByPath } from "./path";
import { isBlank } from "./value";
import type { CdsFieldMapEntry } from "@/types/cds.types";

// Groups field-map entries by their source array-index prefix (e.g. `hero_carousel.results.1`)
function groupKey(source: string): string {
  const match = source.match(/^(.*?\.\d+)(?:\.|$)/);
  return match ? match[1] : source;
}

/** Write a value into a nested target path on an item. */
function setTarget(
  item: Record<string, unknown>,
  target: string,
  value: unknown
): void {
  const parts = target.split(".");
  let node = item;
  for (let i = 0; i < parts.length - 1; i += 1) {
    node[parts[i]] = (node[parts[i]] as Record<string, unknown>) ?? {};
    node = node[parts[i]] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}

/** Returns true if any leaf value in the item is non-blank. */
function hasContent(item: Record<string, unknown>): boolean {
  return Object.values(item).some((value) =>
    value && typeof value === "object"
      ? hasContent(value as Record<string, unknown>)
      : !isBlank(value)
  );
}

/** Resolve a field-map into ordered item objects, dropping empty items. */
export function resolveBoundItems(
  fieldMap: CdsFieldMapEntry[],
  data: unknown
): Record<string, unknown>[] {
  const groups = new Map<string, Record<string, unknown>>();

  for (const { source, target } of fieldMap) {
    const key = groupKey(source);
    const item = groups.get(key) ?? {};
    setTarget(item, target, getByPath(data, source));
    groups.set(key, item);
  }

  // Map preserves insertion order, so render order matches field-map order.
  return [...groups.values()].filter(hasContent);
}
