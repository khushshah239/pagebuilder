import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { AUTHOR_TEMPLATE_LEGACY_URL } from "@/config/cds";

/** Fetches an author profile by slug or numeric id; returns null on failure. */
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

/** One page of an author's article listing. */
export interface AuthorPostsResponse {
  data: Record<string, unknown>[];
  page_no?: number;
  per_page?: number;
}

/** Fetches one page of an author's articles; a short result set means last page. */
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

/** Fetches the shared AuthorPage template; React cache deduplicates within a request. */
export const fetchAuthorTemplate = cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(AUTHOR_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  }
);
