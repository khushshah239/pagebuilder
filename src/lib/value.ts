/**
 * Small, dependency-free value predicates shared across the resolver and
 * prop-builder layers. Kept separate so both the low-level binding resolver and
 * the higher-level organism helpers can use one definition rather than each
 * carrying its own copy.
 */

/** True when a value carries no content — `undefined`, `null`, or `""`. */
export function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}
