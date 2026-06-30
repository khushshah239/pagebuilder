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

export interface CdsArticleTemplate {
  id?: number;
  title?: string;
  data_binding?: { dynamic_fields: CdsBinding[] };
  [key: string]: unknown; // organism entries keyed by schema_slug
}

export interface ArticleCustomEntity {
  id?: string;
  template?: CdsArticleTemplate[];
  related_article?: CdsResultSlot;
  more_from_author?: CdsResultSlot;
  [slot: string]: unknown;
}

export interface ArticleData {
  id?: number;
  title?: string;
  summary?: string;
  legacy_url?: string;
  custom_entity?: ArticleCustomEntity;
  [field: string]: unknown;
}

export type CdsArticleResponse = CdsEnvelope<ArticleData>;
