import { cache } from "react";
import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";

/**
 * Fetch the shared video page template by its legacy URL. The template's
 * `custom_entity` holds the organism layout + `data_bindings`. React's `cache`
 * de-duplicates calls within one request so every video page render shares one
 * HTTP round-trip.
 */
export const fetchVideoTemplate = cache(
  async (legacyUrl: string): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{
      data?: { custom_entity?: Record<string, unknown> };
    }>(postByLegacyUrlPath(legacyUrl));
    return response.data?.custom_entity ?? {};
  }
);
