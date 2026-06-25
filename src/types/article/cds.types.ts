// Article template organisms are named keys (articlehero, articleheader, …) + data_binding.
import type { CdsBinding, CdsEnvelope } from "@/types/cds.types";

export type {
  CdsBinding,
  CdsFieldMapEntry,
  CdsLayoutOrganism,
} from "@/types/cds.types";

/** A list slot feeding a collection organism. */
interface CdsResultSlot {
  heading?: string;
  results?: Record<string, unknown>[];
}

/** Selected ArticlePageTemplate variant; organism keys appear in render order. */
export interface CdsArticleTemplate {
  id?: number;
  title?: string;
  data_binding?: { dynamic_fields: CdsBinding[] };
  [key: string]: unknown; // organism entries keyed by schema_slug
}

/** `data.custom_entity` of an article: template variant + collection slots. */
export interface ArticleCustomEntity {
  id?: string;
  template?: CdsArticleTemplate[];
  related_article?: CdsResultSlot;
  more_from_author?: CdsResultSlot;
  [slot: string]: unknown;
}

/** `data` of an article response: post fields + custom_entity with template and slots. */
export interface ArticleData {
  id?: number;
  title?: string;
  summary?: string;
  legacy_url?: string;
  custom_entity?: ArticleCustomEntity;
  [field: string]: unknown;
}

/** Full article CDS response. */
export type CdsArticleResponse = CdsEnvelope<ArticleData>;
