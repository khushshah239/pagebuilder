// CDS-curated lists can include the current post — dedupe matches by id, then by URL.

/** Normalizes a URL to a comparable pathname. */
function normUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  let s = value.trim().toLowerCase();
  try {
    s = new URL(s).pathname;
  } catch {}
  return s.replace(/\/+$/, "");
}

/** True if `item` is the post identified by `currentId`/`currentUrls`. */
function isCurrentPost(
  item: Record<string, unknown>,
  currentId: number,
  currentUrls: Set<string>
): boolean {
  if (currentId > 0 && Number(item.id) === currentId) return true;
  const url = normUrl(item.legacy_url ?? item.absolute_url ?? item.url_slug ?? item.url);
  return url !== "" && currentUrls.has(url);
}

/** Removes the current post from a raw CDS results array, by id then URL. */
export function dropCurrentFromResults(
  results: Record<string, unknown>[],
  currentId: number,
  currentUrls: Array<string | undefined>
): Record<string, unknown>[] {
  const urlSet = new Set(currentUrls.map(normUrl).filter(Boolean));
  return results.filter((item) => !isCurrentPost(item, currentId, urlSet));
}

/** nested: true → field is { results: [...] }, false → field is a plain array. */
export type ListOrganismConfig = {
  schemaSlug: string;
  defaultField: string;
  nested: boolean;
};

type PostWithLists = {
  id?: unknown;
  legacy_url?: unknown;
  absolute_url?: unknown;
  custom_entity?: Record<string, unknown> | null;
  [key: string]: unknown;
};

/** Removes the current post from each configured list (checks custom_entity, then post root). */
export function excludeCurrentFromLists(
  post: PostWithLists,
  configs: readonly ListOrganismConfig[],
  resolveFieldName: (schemaSlug: string) => string
): Record<string, unknown> {
  const customEntity = post.custom_entity ?? {};
  const currentId = Number(post.id) || 0;
  const currentUrls = [post.legacy_url as string | undefined, post.absolute_url as string | undefined];

  const updatedFields: Record<string, unknown> = {};

  for (const { schemaSlug, defaultField, nested } of configs) {
    const fieldName = resolveFieldName(schemaSlug) || defaultField;
    const rawField = customEntity[fieldName] ?? post[fieldName];
    const rawList = nested
      ? ((rawField as { results?: Record<string, unknown>[] } | null)?.results ?? [])
      : ((rawField as Record<string, unknown>[] | null) ?? []);

    updatedFields[fieldName] = nested
      ? { results: dropCurrentFromResults(rawList, currentId, currentUrls) }
      : dropCurrentFromResults(rawList, currentId, currentUrls);
  }

  return updatedFields;
}

/** Schema slug → prop holding its item array. */
const DEDUPE_ITEM_PROP: Record<string, string> = {
  relatedarticlesrow: "related_cards",
  morefromauthorrow: "author_articles",
  trendingarticlesrow: "trending_cards",
};

/** Filters the current article out of an organism's item-list prop, if it has one. */
export function excludeCurrentArticle(
  schemaSlug: string,
  props: Record<string, unknown>,
  currentUrls: Array<string | undefined>
): Record<string, unknown> {
  const itemsProp = DEDUPE_ITEM_PROP[schemaSlug];
  if (!itemsProp) return props;

  const items = props[itemsProp];
  if (!Array.isArray(items)) return props;

  const filtered = dropCurrentFromResults(items as Record<string, unknown>[], 0, currentUrls);
  return filtered.length === items.length ? props : { ...props, [itemsProp]: filtered };
}
