// Raw CDS payload shapes. These describe what the API returns, before it is
// adapted into the presentational `organism.types.ts` props.

/** Every CDS response is wrapped in this envelope. */
export interface CdsEnvelope<T> {
  status: unknown;
  data: T;
  "Cache-Tags"?: unknown;
}

/** A CDS media object — the resolved image URL lives on `absolute_path`. */
export interface CdsMedia {
  absolute_path?: string;
  path?: string;
  [key: string]: unknown;
}

/** A single article inside a data slot (lean shape — note: no guaranteed `summary`). */
export interface CdsArticle {
  id?: number;
  title?: string;
  summary?: string;
  primary_category?: { name?: string } | null;
  media_file_banner?: CdsMedia | Record<string, never>;
  [key: string]: unknown;
}

/** A "wrapped" data slot, e.g. `hero_carousel`, `breaking_news`. */
export interface CdsSlot {
  heading?: string;
  results: CdsArticle[];
}

/** One source → target mapping inside a binding. */
export interface CdsFieldMapEntry {
  source: string;
  target: string;
}

/** The bindings for a single organism, keyed by its `organism_id`. */
export interface CdsBinding {
  organism_id: string;
  field_map: { dynamic_fields: CdsFieldMapEntry[] };
}

/** One organism in the template layout, carrying its inline default content. */
export interface CdsLayoutOrganism {
  schema_id?: string;
  schema_slug: string;
  dynamic_fields: Array<Record<string, unknown>>;
}

/** The template relation embedded in the homepage payload. */
export interface CdsTemplate {
  id?: number;
  title?: string;
  legacy_url?: string;
  layout: CdsLayoutOrganism[];
  bindings: { dynamic_fields: CdsBinding[] };
}

/** `data.custom_entity` of the homepage: live slots + the embedded template. */
export interface HomepageCustomEntity {
  id?: string;
  name?: string;
  is_active?: boolean;
  template: CdsTemplate[];
  // Data slots (hero_carousel, breaking_news, featured_articles, …) are dynamic.
  [slot: string]: unknown;
}

/** Full homepage response = the CDS envelope wrapping `{ custom_entity }`. */
export type CdsHomepageResponse = CdsEnvelope<{
  custom_entity: HomepageCustomEntity;
}>;
