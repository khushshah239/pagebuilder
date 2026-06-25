/** Raw CDS payload shapes before the binding layer adapts them to organism props. */

/** Every CDS response is wrapped in this envelope. */
export interface CdsEnvelope<T> {
  status: unknown;
  data: T;
  "Cache-Tags"?: unknown;
}

/** One source→target mapping inside a binding. */
export interface CdsFieldMapEntry {
  source: string;
  target: string;
}

/** Binding for a single organism. */
export interface CdsBinding {
  organism_id: string;
  field_map: { dynamic_fields: CdsFieldMapEntry[] };
}

/** One organism in the template layout with its inline default content. */
export interface CdsLayoutOrganism {
  schema_id?: string;
  schema_slug: string;
  dynamic_fields: Array<Record<string, unknown>>;
}

/** Template embedded in a page payload. */
export interface CdsTemplate {
  id?: number;
  title?: string;
  legacy_url?: string;
  layout: CdsLayoutOrganism[];
  bindings: { dynamic_fields: CdsBinding[] };
}
