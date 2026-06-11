import { CDS_BASE_URL, CDS_PUBLISHER_ID, CDS_AUTH_HEADER } from "../config/cds";
import type {
  ArticleCustomEntity,
  CdsArticleResponse,
} from "../types/article/article-cds.types";

/**
 * Fetch an article template by its legacy URL. Returns the raw
 * `{ status, data, Cache-Tags }` envelope.
 */
export async function fetchArticle(
  legacyUrl: string
): Promise<CdsArticleResponse> {
  const url = `${CDS_BASE_URL}/publisher/${CDS_PUBLISHER_ID}/post/?legacy_url=${legacyUrl}`;

  const response = await fetch(url, {
    headers: { Authorization: CDS_AUTH_HEADER },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `CDS fetch failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<CdsArticleResponse>;
}

/** Pull `custom_entity` out, tolerating both enveloped and bare responses. */
export function extractArticleEntity(
  response: CdsArticleResponse
): ArticleCustomEntity {
  const root = response as unknown as {
    data?: { custom_entity?: ArticleCustomEntity };
    custom_entity?: ArticleCustomEntity;
  };
  const customEntity = root.data?.custom_entity ?? root.custom_entity;
  if (!customEntity) {
    throw new Error("CDS response is missing custom_entity");
  }
  return customEntity;
}
