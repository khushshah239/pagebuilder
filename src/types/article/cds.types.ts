/**
 * Raw CDS shapes for the ArticlePage entity and its selected ArticlePageTemplate.
 *
 * Unlike the homepage (whose template carries a `layout` Dynamic Zone and a
 * `bindings` array), an article response puts the post fields on `data.*`, and
 * the chosen template variant on `data.custom_entity.template[0]`. That template
 * lists each selected organism as a NAMED key (`articlehero`, `articleheader`,
 * …, in render order) plus a `data_binding` field-map. Picking a different
 * variant when authoring simply yields a different set of organism keys here.
 */
import type { CdsBinding, CdsEnvelope } from "@/types/cds.types";

export type {
  CdsBinding,
  CdsFieldMapEntry,
  CdsLayoutOrganism,
} from "@/types/cds.types";

/** A list slot feeding a collection organism (e.g. `related_article`). */
interface CdsResultSlot {
  heading?: string;
  results?: Record<string, unknown>[];
}

/**
 * The selected ArticlePageTemplate variant. Each chosen organism appears as a
 * named key holding `{ schema_slug, dynamic_fields }` (the organism's inline
 * default), in the order they should render. `data_binding` maps live source
 * paths onto each organism's slots.
 */
export interface CdsArticleTemplate {
  id?: number;
  title?: string;
  data_binding?: { dynamic_fields: CdsBinding[] };
  /** Organism entries, keyed by `schema_slug`, plus assorted metadata fields. */
  [key: string]: unknown;
}

/** `data.custom_entity` of an article: the template variant + collection slots. */
export interface ArticleCustomEntity {
  id?: string;
  template?: CdsArticleTemplate[];
  related_article?: CdsResultSlot;
  more_from_author?: CdsResultSlot;
  [slot: string]: unknown;
}

/**
 * `data` of an article response: the post's own fields (bindings address them
 * directly, e.g. `summary`, `tags.0.name`, `content_html`) plus its
 * `custom_entity` (which holds the template and the `related_article` /
 * `more_from_author` collection slots).
 */
export interface ArticleData {
  id?: number;
  title?: string;
  summary?: string;
  legacy_url?: string;
  custom_entity?: ArticleCustomEntity;
  [field: string]: unknown;
}

/** Full article response = the CDS envelope wrapping the article `data`. */
export type CdsArticleResponse = CdsEnvelope<ArticleData>;
