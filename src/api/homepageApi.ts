import { CDS_BASE_URL, CDS_PUBLISHER_ID, CDS_AUTH_HEADER } from "../config/cds";
import type {
  CdsHomepageResponse,
  HomepageCustomEntity,
} from "../types/homepage/cds.types";

/**
 * Fetch a post-addressable CDS entity (e.g. the homepage) by its legacy URL.
 * Returns the raw `{ status, data, Cache-Tags }` envelope — the caller unwraps
 * `data.custom_entity`.
 */
export async function fetchHomepage(
  legacyUrl: string
): Promise<CdsHomepageResponse> {
  const url = `${CDS_BASE_URL}/publisher/${CDS_PUBLISHER_ID}/post/?legacy_url=${legacyUrl}`;

  const response = await fetch(url, {
    headers: { Authorization: CDS_AUTH_HEADER },
  });

  if (!response.ok) {
    throw new Error(
      `CDS fetch failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<CdsHomepageResponse>;
}

/**
 * Pull `custom_entity` out of a CDS response, tolerating both shapes:
 *   - enveloped:  { status, data: { custom_entity }, "Cache-Tags" }
 *   - bare:       { custom_entity }
 * The live `/post/?legacy_url=` endpoint returns the enveloped form.
 */
export function extractCustomEntity(
  response: CdsHomepageResponse
): HomepageCustomEntity {
  const root = response as unknown as {
    data?: { custom_entity?: HomepageCustomEntity };
    custom_entity?: HomepageCustomEntity;
  };
  const customEntity = root.data?.custom_entity ?? root.custom_entity;
  if (!customEntity) {
    throw new Error("CDS response is missing custom_entity");
  }
  return customEntity;
}
