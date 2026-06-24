import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { SECTION_TEMPLATE_LEGACY_URL } from "@/config/cds";

export interface CategoryInfo {
  id?: number;
  name: string;
  slug?: string;
  parent_category?: unknown;
}

/**
 * SectionPage (category) data access. A category route resolves in three calls:
 *   1. `identifyUrl` — is this legacy URL a category or a post?
 *   2. `fetchSectionTemplate` — the shared layout + bindings (fetched once).
 *   3. `fetchCategoryPosts` — one page of the category's articles.
 */

/** What the CDS `identify_url` endpoint reports for a legacy URL. */
export interface IdentifyResult {
  /** e.g. `"category"` or `"post"`. */
  type: string;
  /** The normalised URL/slug (no leading slash for categories). */
  url: string;
}

/**
 * Classify a legacy URL via the CDS so the catch-all route knows whether to
 * render a category (SectionPage) or an article. Returns `null` on failure so
 * the caller can fall back to the article flow.
 */
export async function identifyUrl(
  legacyUrl: string
): Promise<IdentifyResult | null> {
  try {
    const response = await cdsFetch<{ data?: IdentifyResult }>(
      `/identify_url/?legacy_url=${legacyUrl}`
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

/**
 * The shared SectionPage template `custom_entity` (layout + `data_binding`).
 * Wrapped in React's `cache` so the page render and the pagination API route
 * de-duplicate it within a request rather than re-fetching the same template.
 */
export const fetchSectionTemplate = cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(SECTION_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  }
);

/** One page of a category article listing. */
export interface CategoryPostsResponse {
  data: Record<string, unknown>[];
  page_no?: number;
  per_page?: number;
}

/**
 * Fetch the category record by its slug (name, id, parent_category, etc.).
 * Returns null on failure so the hero banner can still fall back to the
 * template default heading.
 */
export async function fetchCategory(
  slug: string
): Promise<CategoryInfo | null> {
  try {
    const response = await cdsFetch<{ data?: CategoryInfo }>(
      `/category/${slug}/`
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}
/**
 * Fetch one page of a category's articles (newest first), filtered by category
 * slug. The endpoint returns no total count, so callers detect the last page by
 * a short result set (fewer than `limit`).
 */
export async function fetchCategoryPosts(
  slug: string,
  page: number,
  limit: number
): Promise<CategoryPostsResponse> {
  const path = `/posts/?type__eq=Article&categories.slug__eq=${slug}&page=${page}&limit=${limit}`;
  const response = await cdsFetch<CategoryPostsResponse>(path);
  return {
    data: Array.isArray(response.data) ? response.data : [],
    page_no: response.page_no,
    per_page: response.per_page,
  };
}
