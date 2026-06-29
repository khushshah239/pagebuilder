// Removes the article currently being viewed from the related / more-from-author
// / trending lists so a story never links to itself. The CDS-curated lists
// inside custom_entity can include the current post, and server-side fetches
// only exclude by id — this also catches the curated case by matching URLs.

/** List organisms that must never contain the current article, mapped to the
 *  prop holding their item array. */
const DEDUPE_ITEM_PROP: Record<string, string> = {
  relatedarticlesrow: "related_cards",
  morefromauthorrow: "author_articles",
  trendingarticlesrow: "trending_cards",
};

/** Removes the current article from a raw CDS results array (by id, then URL).
 *  Run this on the source `results` BEFORE the field-map binding reads them, so
 *  the binding's indices map onto other articles and naturally backfill the next
 *  item instead of leaving a gap. */
export function dropCurrentFromResults(
  results: Record<string, unknown>[],
  currentId: number,
  currentUrls: Array<string | undefined>
): Record<string, unknown>[] {
  const current = new Set(currentUrls.map(normUrl).filter(Boolean));
  return results.filter((item) => {
    if (currentId > 0 && Number(item.id) === currentId) return false;
    const url = normUrl(item.legacy_url ?? item.absolute_url ?? item.url_slug ?? item.url);
    return !url || !current.has(url);
  });
}

/** Normalize a URL to a comparable pathname (host stripped, lowercased, no trailing slash). */
function normUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  let s = value.trim().toLowerCase();
  try {
    s = new URL(s).pathname;
  } catch {
    // already a relative path
  }
  return s.replace(/\/+$/, "");
}

/** Returns props with the current article filtered out of the item list (when
 *  the organism is one that lists other articles). Other organisms pass through
 *  unchanged. If every item was the current article, the list becomes empty and
 *  the organism component renders nothing. */
export function excludeCurrentArticle(
  schemaSlug: string,
  props: Record<string, unknown>,
  currentUrls: Array<string | undefined>
): Record<string, unknown> {
  const itemsProp = DEDUPE_ITEM_PROP[schemaSlug];
  if (!itemsProp) return props;

  const items = props[itemsProp];
  if (!Array.isArray(items)) return props;

  const current = new Set(currentUrls.map(normUrl).filter(Boolean));
  if (current.size === 0) return props;

  const filtered = items.filter((item) => {
    const it = item as Record<string, unknown>;
    const url = normUrl(it.url_slug ?? it.url);
    return !url || !current.has(url);
  });

  return filtered.length === items.length ? props : { ...props, [itemsProp]: filtered };
}
