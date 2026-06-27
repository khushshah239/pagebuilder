import { unstable_cache } from "next/cache";
import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";
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
    return { data: all.filter((a) => Number(a["id"]) !== excludeId).slice(0, limit) };
  } catch (err) {
    console.error("[CDS] fetchRelatedArticles failed:", err);
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
    return { data: all.filter((a) => Number(a["id"]) !== excludeId).slice(0, limit) };
  } catch (err) {
    console.error("[CDS] fetchMoreFromAuthor failed:", err);
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
    return { data: all.filter((a) => Number(a["id"]) !== excludeId).slice(0, limit) };
  } catch (err) {
    console.error("[CDS] fetchLatestNews failed:", err);
    return { data: [] };
  }
}

/** Toggles trailing slash on a legacy URL. */
function toggleTrailingSlash(legacyUrl: string): string {
  return legacyUrl.endsWith("/") ? legacyUrl.slice(0, -1) : `${legacyUrl}/`;
}

// Cross-request cache: same article URL returns instantly for 60s after first fetch.
const fetchArticleFromCDS = unstable_cache(
  async (legacyUrl: string): Promise<CdsArticleResponse> => {
    try {
      return await cdsFetch<CdsArticleResponse>(postByLegacyUrlPath(legacyUrl));
    } catch (err) {
      // Only retry with a toggled trailing slash on 404 — auth errors and network
      // failures propagate immediately to avoid masking the real problem.
      if ((err as { status?: number }).status !== 404) throw err;
      return cdsFetch<CdsArticleResponse>(
        postByLegacyUrlPath(toggleTrailingSlash(legacyUrl))
      );
    }
  },
  [`${CDS_PUBLISHER_ID}-article`],
  { revalidate: 60 }
);

// Per-request dedup on top of cross-request cache.
export const fetchArticle = cache(fetchArticleFromCDS);
