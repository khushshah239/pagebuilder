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
/**
 * Example — fieldMap (2 items, 3 fields each):
 *   [
 *     { source: "related_article.results.0.title",            target: "title" },
 *     { source: "related_article.results.0.media_file_banner.path", target: "thumbnail" },
 *     { source: "related_article.results.0.contributors.0.name",    target: "author_name" },
 *     { source: "related_article.results.1.title",            target: "title" },
 *     { source: "related_article.results.1.media_file_banner.path", target: "thumbnail" },
 *     { source: "related_article.results.1.contributors.0.name",    target: "author_name" },
 *   ]
 *
 * data.related_article.results = [
 *   { title: "Article A", media_file_banner: { path: "a.jpg" }, contributors: [{ name: "Alex" }] },
 *   { title: "",           media_file_banner: { path: "b.jpg" }, contributors: [{ name: "Sam"  }] },
 * ]
 *
 * Step 1 — groupKey() finds the FIRST ".N" in each source (the item index),
 * ignoring any nested index further down the path (contributors.0 is skipped):
 *   "related_article.results.0.title"              -> groupKey "related_article.results.0"
 *   "related_article.results.0.contributors.0.name" -> groupKey "related_article.results.0"  (still index 0, not "contributors" index)
 *   "related_article.results.1.title"              -> groupKey "related_article.results.1"
 *
 * Step 2 — for each entry: getByPath(data, source) fetches the live value,
 * setTarget(item, target, value) writes it onto the item under its TARGET name
 * (not its source name) — flat targets like "title" just do item.title = value.
 *
 * Step 3 — entries with the same groupKey accumulate into the same item object:
 *   group "related_article.results.0" -> { title: "Article A", thumbnail: "a.jpg", author_name: "Alex" }
 *   group "related_article.results.1" -> { title: "",           thumbnail: "b.jpg", author_name: "Sam"  }
 *
 * Step 4 — hasContent() drops items where every field is blank. Item 1 still
 * has thumbnail + author_name even though title is "", so isBlank() checks
 * each leaf individually — the item survives unless ALL fields are blank
 * (e.g. an index the live data doesn't actually have, so every getByPath
 * returns undefined).
 *
 * Final result (Map preserves insertion order, so output order = fieldMap order):
 *   [
 *     { title: "Article A", thumbnail: "a.jpg", author_name: "Alex" },
 *     { title: "",           thumbnail: "b.jpg", author_name: "Sam"  },
 *   ]
 */