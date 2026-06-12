import { cache } from "react";
import { CDS_BASE_URL, CDS_PUBLISHER_ID, CDS_AUTH_HEADER } from "../config/cds";
import { extractArticleEntity } from "./articleApi";
import type { CdsArticleResponse } from "../types/article/article-cds.types";

/**
 * The CDS exposes no endpoint to list ArticlePages, so we discover them by their
 * slug convention `article<n>` (article1, article2, …), stopping after a run of
 * consecutive misses. The resulting index maps each underlying article's
 * `legacy_url` to the ArticlePage slug that renders it — so a card linking to a
 * post can resolve to `/article/<articlePageSlug>`.
 */
const MAX_ARTICLE_PAGES = 50;
const STOP_AFTER_MISSES = 5;

function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** Fetch one ArticlePage by slug, returning null when it doesn't exist. */
async function fetchArticlePageEntity(slug: string) {
  const url = `${CDS_BASE_URL}/publisher/${CDS_PUBLISHER_ID}/post/?legacy_url=/articlepages/${slug}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: CDS_AUTH_HEADER },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const entity = extractArticleEntity((await res.json()) as CdsArticleResponse);
    return entity.template?.length && entity.post?.length ? entity : null;
  } catch {
    return null;
  }
}

/** Map of post `legacy_url` (trailing slash stripped) → ArticlePage slug. */
export type ArticlePageIndex = Map<string, string>;

/**
 * Build the post→ArticlePage index. Memoised per request via React `cache`, and
 * the underlying CDS reads are ISR-cached, so repeated calls are cheap.
 */
export const getArticlePageIndex = cache(async (): Promise<ArticlePageIndex> => {
  const index: ArticlePageIndex = new Map();
  let misses = 0;

  for (let n = 1; n <= MAX_ARTICLE_PAGES && misses < STOP_AFTER_MISSES; n += 1) {
    const slug = `article${n}`;
    const entity = await fetchArticlePageEntity(slug);
    if (!entity) {
      misses += 1;
      continue;
    }
    misses = 0;
    const post = (entity.post?.[0] ?? {}) as { legacy_url?: string };
    if (post.legacy_url) index.set(stripSlash(post.legacy_url), slug);
  }

  return index;
});

/** A resolver: post `legacy_url` → `/article/<slug>`, or undefined if uncurated. */
export type ArticleLinkResolver = (legacyUrl?: string) => string | undefined;

/**
 * Resolve a post `legacy_url` to its ArticlePage route. Returns undefined when
 * no ArticlePage renders that post — so only curated articles become links.
 */
export function makeArticleLinkResolver(
  index: ArticlePageIndex
): ArticleLinkResolver {
  return (legacyUrl?: string) => {
    if (!legacyUrl) return undefined;
    const slug = index.get(stripSlash(legacyUrl));
    return slug ? `/article/${slug}` : undefined;
  };
}
