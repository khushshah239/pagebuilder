import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import type { CdsArticleResponse } from "@/types/article/cds.types";

export interface ArticleListResponse {
  data: Record<string, unknown>[];
}

/** Fetches related articles by category, excluding the given article id. */
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

/** Fetches recent articles by contributor id, excluding the given article. */
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

/** Fetches recent site-wide articles, excluding the given article. */
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

/** Toggles trailing slash on a legacy URL. */
function toggleTrailingSlash(legacyUrl: string): string {
  return legacyUrl.endsWith("/") ? legacyUrl.slice(0, -1) : `${legacyUrl}/`;
}

// Retries with trailing slash toggled because CDS legacy_url slash is inconsistent.
// React cache deduplicates calls within the same request.
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
