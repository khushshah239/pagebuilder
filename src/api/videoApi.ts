import { unstable_cache } from "next/cache";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";

/** Fetches the shared VideoPage template; cached across requests. */
export const fetchVideoTemplate = unstable_cache(
  async (legacyUrl: string): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(legacyUrl));
    return response.data?.custom_entity ?? {};
  },
  [`${CDS_PUBLISHER_ID}-video-template`],
  { revalidate: 300 }
);
