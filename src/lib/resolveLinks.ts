import type { ArticleLinkResolver } from "../api/articlePageIndex";

/**
 * Rewrite every `url_slug` in an organism's props from a post `legacy_url` to
 * its ArticlePage route (`/article/<slug>`), or `undefined` when the post has no
 * ArticlePage — so only curated articles render as links. Handles a top-level
 * `url_slug` (e.g. PostGrid's lead) and `url_slug` on items inside any array
 * prop (slides, cards, stories, sidecards, …).
 */
export function resolveOrganismLinks(
  props: Record<string, unknown>,
  resolveLink: ArticleLinkResolver
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...props };

  if (typeof out.url_slug === "string") {
    out.url_slug = resolveLink(out.url_slug);
  }

  for (const [key, value] of Object.entries(out)) {
    if (!Array.isArray(value)) continue;
    out[key] = value.map((item) => {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        if (typeof record.url_slug === "string") {
          return { ...record, url_slug: resolveLink(record.url_slug) };
        }
      }
      return item;
    });
  }

  return out;
}
