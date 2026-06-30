import { unstable_cache } from "next/cache";
import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";
import type { CdsArticleResponse } from "@/types/article/cds.types";

/** Toggles trailing slash on a legacy URL. */
function toggleTrailingSlash(legacyUrl: string): string {
  return legacyUrl.endsWith("/") ? legacyUrl.slice(0, -1) : `${legacyUrl}/`;
}

// Next.js strips the trailing slash from incoming URLs (308 redirect) before
// this ever runs, but CDS legacy_urls require it — so retry with it added/removed
// on 404 before giving up.
const fetchArticleFromCDS = unstable_cache(
  async (legacyUrl: string): Promise<CdsArticleResponse> => {
    try {
      return await cdsFetch<CdsArticleResponse>(postByLegacyUrlPath(legacyUrl));
    } catch (err) {
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
