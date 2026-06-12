import type { CdsEnvelope, CdsFieldMapEntry } from "../homepage/cds.types";

/** One organism binding inside an article template's `data_binding`. */
export interface CdsArticleBinding {
  organism_id: string;
  field_map: { dynamic_fields: CdsFieldMapEntry[] };
}

/**
 * The template relation embedded in an article page. Unlike the homepage there
 * is NO ordered `layout[]` — organisms are named keys (`articlehero`, …) and
 * carry their inline default content. Render order is fixed in code.
 */
export interface CdsArticleTemplate {
  id?: number;
  title?: string;
  data_binding?: { dynamic_fields: CdsArticleBinding[] };
  // Organism slots (articlehero, articlebody, …) are dynamic keys.
  [organismKey: string]: unknown;
}

/** The article chosen for this page (lives in `custom_entity.post[0]`). */
export interface CdsPost {
  id?: number;
  title?: string;
  legacy_url?: string;
  summary?: string;
  short_description?: string;
  banner_url?: string;
  content?: string;
  media_file_banner?: { absolute_path?: string; path?: string };
  formatted_first_published_at_datetime?: string;
  published_at_datetime?: string;
  [key: string]: unknown;
}

/**
 * `data.custom_entity` of an article page: the chosen article (`post[0]`), the
 * live related/author slots, plus the embedded template relation.
 */
export interface ArticleCustomEntity {
  id?: string;
  title?: string;
  post?: CdsPost[];
  template: CdsArticleTemplate[];
  [key: string]: unknown;
}

/** Full article-page response = the CDS envelope wrapping `{ custom_entity }`. */
export type CdsArticleResponse = CdsEnvelope<{
  custom_entity: ArticleCustomEntity;
}>;
