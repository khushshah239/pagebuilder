import type { CdsEnvelope, CdsTemplate } from "@/types/cds.types";

export type {
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
} from "@/types/cds.types";

/** `data.custom_entity` of the homepage: embedded template plus live data slots. */
export interface HomepageCustomEntity {
  id?: string;
  name?: string;
  is_active?: boolean;
  template: CdsTemplate[];
  [slot: string]: unknown;
}

/** Full homepage CDS response. */
export type CdsHomepageResponse = CdsEnvelope<{
  custom_entity: HomepageCustomEntity;
}>;
