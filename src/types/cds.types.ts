export interface CdsEnvelope<T> {
  status: unknown;
  data: T;
  "Cache-Tags"?: unknown;
}

export interface CdsFieldMapEntry {
  source: string;
  target: string;
}

export interface CdsBinding {
  organism_id: string;
  field_map: { dynamic_fields: CdsFieldMapEntry[] };
}

export interface CdsLayoutOrganism {
  schema_id?: string;
  schema_slug: string;
  dynamic_fields: Array<Record<string, unknown>>;
}

export interface CdsTemplate {
  id?: number;
  title?: string;
  legacy_url?: string;
  layout: CdsLayoutOrganism[];
  bindings: { dynamic_fields: CdsBinding[] };
}
