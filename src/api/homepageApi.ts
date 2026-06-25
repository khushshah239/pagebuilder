import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import type {
  CdsHomepageResponse,
  HomepageCustomEntity,
} from "@/types/homepage/cds.types";

/** Fetches the homepage CDS envelope by legacy URL. */
export async function fetchHomepage(
  legacyUrl: string
): Promise<CdsHomepageResponse> {
  return cdsFetch<CdsHomepageResponse>(postByLegacyUrlPath(legacyUrl));
}

// Merges top-level post fields into custom_entity so all binding sources resolve.
// custom_entity keys win on collision. Throws if custom_entity is absent.
export function extractCustomEntity(
  response: CdsHomepageResponse
): HomepageCustomEntity {
  const root = response as unknown as {
    data?: Record<string, unknown> & { custom_entity?: HomepageCustomEntity };
  };
  const postData = root.data ?? {};
  const customEntity = postData.custom_entity;
  if (!customEntity) {
    throw new Error("CDS response is missing custom_entity");
  }
  // Relation fields first, then overlay custom_entity so its slots win.
  return { ...postData, ...customEntity } as HomepageCustomEntity;
}
