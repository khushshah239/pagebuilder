import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import type { CdsArticleResponse } from "@/types/article/cds.types";

export interface ArticleListResponse {
  data: Record<string, unknown>[];
}

/** Fetch articles from the same category, excluding the current article by id. */
export async function fetchRelatedArticles(
  categorySlug: string,
  excludeId: number,
  limit: number
): Promise<ArticleListResponse> {
  try {
    const path = `/posts/?type__eq=Article&categories.slug__eq=${categorySlug}&limit=${limit + 1}`;
    const response = await cdsFetch<ArticleListResponse>(path);
    const all = Array.isArray(response.data) ? response.data : [];
    return { data: all.filter((a) => (a as Record<string, unknown>).id !== excludeId).slice(0, limit) };
  } catch {
    return { data: [] };
  }
}

/** Fetch recent articles by the same author (contributor id), excluding the current article. */
export async function fetchMoreFromAuthor(
  authorId: number,
  excludeId: number,
  limit: number
): Promise<ArticleListResponse> {
  try {
    const path = `/posts/?type__eq=Article&contributors.id__eq=${authorId}&limit=${limit + 1}`;
    const response = await cdsFetch<ArticleListResponse>(path);
    const all = Array.isArray(response.data) ? response.data : [];
    return { data: all.filter((a) => (a as Record<string, unknown>).id !== excludeId).slice(0, limit) };
  } catch {
    return { data: [] };
  }
}

/** Fetch recent articles site-wide (for sidebar "Latest News"). */
export async function fetchLatestNews(
  excludeId: number,
  limit: number
): Promise<ArticleListResponse> {
  try {
    const path = `/posts/?type__eq=Article&limit=${limit + 1}`;
    const response = await cdsFetch<ArticleListResponse>(path);
    const all = Array.isArray(response.data) ? response.data : [];
    return { data: all.filter((a) => (a as Record<string, unknown>).id !== excludeId).slice(0, limit) };
  } catch {
    return { data: [] };
  }
}

/** The same legacy URL with its trailing slash toggled on/off. */
function toggleTrailingSlash(legacyUrl: string): string {
  return legacyUrl.endsWith("/") ? legacyUrl.slice(0, -1) : `${legacyUrl}/`;
}

/**
 * Fetch an article by its legacy URL. CDS stores `legacy_url` with an exact
 * trailing slash (some articles have one, some don't) while Next normalises it
 * away, so we try the URL as given and, on failure, retry with the slash
 * toggled. Wrapped in React's `cache` so the page render and `generateMetadata`
 * for the same request de-duplicate.
 */
export const fetchArticle = cache(
  async (legacyUrl: string): Promise<CdsArticleResponse> => {
    try {
      return await cdsFetch<CdsArticleResponse>(postByLegacyUrlPath(legacyUrl));
    } catch {
      return cdsFetch<CdsArticleResponse>(
        postByLegacyUrlPath(toggleTrailingSlash(legacyUrl))
      );
    }
  }
);
