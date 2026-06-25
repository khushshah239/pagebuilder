/** True when a value is undefined, null, or empty string. */
export function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}
