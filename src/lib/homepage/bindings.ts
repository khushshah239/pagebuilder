import { getByPath } from "./path";
import type { CdsFieldMapEntry } from "../../types/cds.types";

/**
 * Group key = the source prefix up to and including its first array-index
 * segment (e.g. "hero_carousel.results.1" or "featured_articles.0"). Every
 * field-map entry sharing a key belongs to the same item.
 */
function groupKey(source: string): string {
  const match = source.match(/^(.*?\.\d+)(?:\.|$)/);
  return match ? match[1] : source;
}

/** Assign `value` into `item` at a (possibly dotted) target like "sidecards.title". */
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

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

/** An item is "real" if at least one (possibly nested) leaf has live content. */
function hasContent(item: Record<string, unknown>): boolean {
  return Object.values(item).some((value) =>
    value && typeof value === "object"
      ? hasContent(value as Record<string, unknown>)
      : !isBlank(value)
  );
}

/**
 * Resolve a binding field-map into an ordered list of item objects.
 *
 * Field-maps are chunked by source array-index (results.0, results.1, …); each
 * chunk becomes one item whose keys are the binding `target`s. Items that
 * resolve to nothing (slot shorter than the binding, or missing data) are
 * dropped, so an empty result means "no live data — use the template default".
 */
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

  return [...groups.values()].filter(hasContent);
}
