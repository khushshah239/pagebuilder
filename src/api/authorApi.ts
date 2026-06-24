import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { AUTHOR_TEMPLATE_LEGACY_URL } from "@/config/cds";

/**
 * AuthorPage data access. An author route resolves in a few calls:
 *   1. `identifyUrl` (in sectionApi) reports `type: "member"` + the author slug.
 *   2. `fetchAuthorProfile` — the profile by slug (or id); it carries the numeric
 *      `id` the posts endpoint needs. (The `/authors/` list is a capped 10-row
 *      org-member list and does NOT contain every post contributor, so it can't
 *      resolve an arbitrary slug — the `/author/{slug}/` detail endpoint does.)
 *   3. `fetchAuthorPosts` — one page of the author's articles (by contributor id).
 *   4. `fetchAuthorTemplate` — the shared layout + bindings (fetched once).
 */

/**
 * The author's profile (name, avatar, bio, social links, and `id`). The CDS
 * detail endpoint accepts either the numeric id or the slug, so the slug from
 * `identify_url` resolves directly. Returns `null` when the author can't be
 * resolved, so the route can render a 404 cleanly.
 */
export async function fetchAuthorProfile(
  idOrSlug: string | number
): Promise<Record<string, unknown> | null> {
  try {
    const response = await cdsFetch<{ data?: Record<string, unknown> }>(
      `/author/${idOrSlug}/`
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

/** One page of an author's articles. */
export interface AuthorPostsResponse {
  data: Record<string, unknown>[];
  page_no?: number;
  per_page?: number;
}

/**
 * Fetch one page of an author's articles (newest first), filtered by contributor
 * id. The endpoint returns no total count, so callers detect the last page by a
 * short result set (fewer than `limit`).
 */
export async function fetchAuthorPosts(
  id: number,
  page: number,
  limit: number
): Promise<AuthorPostsResponse> {
  const path = `/posts/?contributors.id__eq=${id}&page=${page}&limit=${limit}`;
  const response = await cdsFetch<AuthorPostsResponse>(path);
  return {
    data: Array.isArray(response.data) ? response.data : [],
    page_no: response.page_no,
    per_page: response.per_page,
  };
}

/**
 * The shared AuthorPage template `custom_entity` (layout + `data_binding`).
 * Wrapped in React's `cache` so the page render and the pagination API route
 * de-duplicate it within a request rather than re-fetching the same template.
 */
export const fetchAuthorTemplate = cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(AUTHOR_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  }
);
