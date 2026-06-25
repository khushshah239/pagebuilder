import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { SECTION_TEMPLATE_LEGACY_URL } from "@/config/cds";

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
      `/identify_url/?legacy_url=${legacyUrl}`
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

/** Fetches the shared SectionPage template; React cache deduplicates within a request. */
export const fetchSectionTemplate = cache(
  async (): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(SECTION_TEMPLATE_LEGACY_URL));
    return response.data?.custom_entity ?? {};
  }
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
  const path = `/posts/?type__eq=Article&categories.slug__eq=${slug}&page=${page}&limit=${limit}`;
  const response = await cdsFetch<CategoryPostsResponse>(path);
  return {
    data: Array.isArray(response.data) ? response.data : [],
    page_no: response.page_no,
    per_page: response.per_page,
  };
}
