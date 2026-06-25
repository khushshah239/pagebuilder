import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";

/** Fetches the shared VideoPage template; React cache deduplicates within a request. */
export const fetchVideoTemplate = cache(
  async (legacyUrl: string): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(legacyUrl));
    return response.data?.custom_entity ?? {};
  }
);
