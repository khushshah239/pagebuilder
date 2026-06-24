/**
 * Raw CDS shapes specific to the HomePage entity and its PageTemplate.
 * Generic CDS primitives (media, articles, bindings, templates) live in
 * `@/types/cds.types`; this file composes them into the homepage payload.
 */
import type { CdsEnvelope, CdsTemplate } from "@/types/cds.types";

export type {
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
} from "@/types/cds.types";

/**
 * `data.custom_entity` of the homepage: the embedded template plus the editor's
 * live data slots (`hero_carousel`, `breaking_news`, `featured_articles`, …) and
 * contentful organism slots (`apppromocard`, `newslettersignupstrip`, …). Slot
 * keys are dynamic, so they are typed as an index signature.
 */
export interface HomepageCustomEntity {
  id?: string;
  name?: string;
  is_active?: boolean;
  template: CdsTemplate[];
  [slot: string]: unknown;
}

/** Full homepage response = the CDS envelope wrapping `{ custom_entity }`. */
export type CdsHomepageResponse = CdsEnvelope<{
  custom_entity: HomepageCustomEntity;
}>;
