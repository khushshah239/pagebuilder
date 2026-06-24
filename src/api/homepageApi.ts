import { cdsFetch, postByLegacyUrlPath } from "./cdsClient";
import type {
  CdsHomepageResponse,
  HomepageCustomEntity,
} from "@/types/homepage/cds.types";

/**
 * Fetch the homepage CustomEntity by its legacy URL. Returns the raw
 * `{ status, data, "Cache-Tags" }` envelope; callers unwrap it with
 * `extractCustomEntity`.
 */
export async function fetchHomepage(
  legacyUrl: string
): Promise<CdsHomepageResponse> {
  return cdsFetch<CdsHomepageResponse>(postByLegacyUrlPath(legacyUrl));
}

/**
 * Pull `custom_entity` out of the CDS envelope and merge top-level post fields
 * (Relation fields like `trending_topic_tags`, `laterst_news_right`, etc.) into
 * it so the binding layer can resolve any source path regardless of whether it
 * lives inside `custom_entity` or at the post root. `custom_entity` keys win on
 * collision (same priority as the article renderer's merged root).
 *
 * @throws Error when `custom_entity` is absent.
 */
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
  // Spread top-level post fields first so Relation fields are reachable, then
  // overlay custom_entity so its slots always win.
  return { ...postData, ...customEntity } as HomepageCustomEntity;
}
