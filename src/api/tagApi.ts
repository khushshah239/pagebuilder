import { unstable_cache } from "next/cache";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { TAG_TEMPLATE_LEGACY_URL } from "@/config/cds";
import { CDS_PUBLISHER_ID } from "@/config/env";

/** Fetches the tag record by slug; returns null on failure. */
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

/** One page of a tag's article listing. */
export interface TagPostsResponse {
  data: Record<string, unknown>[];
  page_no?: number;
  per_page?: number;
}

/** Fetches one page of a tag's articles by tag slug (no numeric ID needed). */
export async function fetchTagPostsBySlug(
  slug: string,
  page: number,
  limit: number
): Promise<TagPostsResponse> {
  const path = `/posts/?type__eq=Article&tags.slug__eq=${slug}&page=${page}&limit=${limit}`;
  const response = await cdsFetch<TagPostsResponse>(path);
  return {
    data: Array.isArray(response.data) ? response.data : [],
    page_no: response.page_no,
    per_page: response.per_page,
  };
}

export const fetchTagTemplate = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(TAG_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  },
  [`${CDS_PUBLISHER_ID}-tag-template`],
  { revalidate: 300 }
);
