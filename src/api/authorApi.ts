import { unstable_cache } from "next/cache";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { AUTHOR_TEMPLATE_LEGACY_URL } from "@/config/cds";
import { CDS_PUBLISHER_ID } from "@/config/env";

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

/** Fetches one page of an author's articles by numeric ID. */
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

export const fetchAuthorTemplate = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(AUTHOR_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  },
  [`${CDS_PUBLISHER_ID}-author-template`],
  { revalidate: 300 }
);
