import { unstable_cache } from "next/cache";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { SECTION_TEMPLATE_LEGACY_URL } from "@/config/cds";
import { CDS_PUBLISHER_ID } from "@/config/env";

export interface CategoryInfo {
  id?: number;
  name: string;
  slug?: string;
  parent_category?: unknown;
}

/** What the CDS `identify_url` endpoint reports for a legacy URL. */
export interface IdentifyResult {
  type: string; // e.g. "category" or "post"
  url: string;
}

/** Classifies a legacy URL as category or post; returns null on failure. */
export async function identifyUrl(
  legacyUrl: string
): Promise<IdentifyResult | null> {
  try {
    const response = await cdsFetch<{ data?: IdentifyResult }>(
      `/identify_url/?legacy_url=${encodeURIComponent(legacyUrl)}`
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

export const fetchSectionTemplate = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(SECTION_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  },
  [`${CDS_PUBLISHER_ID}-section-template`],
  { revalidate: 300 }
);

/** One page of a category's article listing. */
export interface CategoryPostsResponse {
  data: Record<string, unknown>[];
  page_no?: number;
  per_page?: number;
}

/** Fetches the category record by slug; returns null on failure. */
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
/** Fetches one page of a category's articles; a short result set means last page. */
export async function fetchCategoryPosts(
  slug: string,
  page: number,
  limit: number
): Promise<CategoryPostsResponse> {
  const path = `/posts/?type__eq=Article&categories.slug__eq=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`;
  const response = await cdsFetch<CategoryPostsResponse>(path);
  return {
    data: Array.isArray(response.data) ? response.data : [],
    page_no: response.page_no,
    per_page: response.per_page,
  };
}
