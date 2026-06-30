import type { CdsEnvelope, CdsTemplate } from "@/types/cds.types";

export type {
  CdsFieldMapEntry,
  CdsLayoutOrganism,
  CdsTemplate,
} from "@/types/cds.types";

export interface HomepageCustomEntity {
  id?: string;
  name?: string;
  is_active?: boolean;
  template: CdsTemplate[];
  [slot: string]: unknown;
}

export type CdsHomepageResponse = CdsEnvelope<{
  custom_entity: HomepageCustomEntity;
}>;
