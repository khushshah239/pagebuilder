import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { TAG_TEMPLATE_LEGACY_URL } from "@/config/cds";

/**
 * TagPage data access. A tag route resolves in a few calls, mirroring the
 * author/section flow:
 *   1. `identifyUrl` (in sectionApi) reports `type: "tag"` + the tag slug.
 *   2. `fetchTag` — the tag by slug; it carries the numeric `id` the posts
 *      endpoint needs (`/tags/` is not slug-addressable the same way).
 *   3. `fetchTagPosts` — one page of the tag's articles (by tag id).
 *   4. `fetchTagTemplate` — the shared layout + bindings (fetched once).
 */

/**
 * The tag record (`id`, `name`, `slug`, `absolute_url`). The CDS detail endpoint
 * resolves the slug from `identify_url` directly. Returns `null` when the tag
 * can't be resolved, so the route can render a 404 cleanly.
 */
export async function fetchTag(
  slug: string
): Promise<Record<string, unknown> | null> {
  try {
    const response = await cdsFetch<{ data?: Record<string, unknown> }>(
      `/tag/${slug}/`
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

/** One page of a tag's articles. */
export interface TagPostsResponse {
  data: Record<string, unknown>[];
  page_no?: number;
  per_page?: number;
}

/**
 * Fetch one page of a tag's articles (newest first), filtered by tag id. The
 * endpoint returns no total count, so callers detect the last page by a short
 * result set (fewer than `limit`). Only Article-type posts are fetched so that
 * web stories and video posts sharing the tag don't consume binding slots.
 */
export async function fetchTagPosts(
  id: number,
  page: number,
  limit: number
): Promise<TagPostsResponse> {
  const path = `/posts/?type__eq=Article&tags.id__eq=${id}&page=${page}&limit=${limit}`;
  const response = await cdsFetch<TagPostsResponse>(path);
  return {
    data: Array.isArray(response.data) ? response.data : [],
    page_no: response.page_no,
    per_page: response.per_page,
  };
}

/**
 * The shared TagPage template `custom_entity` (layout + `data_binding`). Wrapped
 * in React's `cache` so the page render and the pagination API route de-duplicate
 * it within a request rather than re-fetching the same template.
 */
export const fetchTagTemplate = cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(TAG_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  }
);
