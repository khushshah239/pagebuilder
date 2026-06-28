/** URL fields that contain CDS absolute_url — strip domain, keep only pathname. */
const URL_PATH_KEYS = new Set([
  "category_url",
  "author_url",
  "url_slug",
]);

/** Strips the domain from a CDS absolute_url so links stay on the current site. */
export function toLocalPath(url: unknown): string {
  if (typeof url !== "string" || !url) return "";
  try { return new URL(url).pathname; } catch { return url; }
}

/** Prop keys whose CDS values may be media objects (not plain URL strings). */
export const MEDIA_KEYS = new Set([
  "image",
  "thumbnail",
  "background_image",
  "cover_image",
  "avatar",
  "author_avatar",
  "logo",
  "icon",
]);

/** Extracts URL string from a CDS media object, or passes primitives through. */
export function flattenMedia(value: unknown): string {
  if (value && typeof value === "object") {
    const media = value as Record<string, unknown>;
    return (media.absolute_path as string) ?? (media.path as string) ?? "";
  }
  if (typeof value === "string") return value;
  return "";
}

/** Flattens media-typed fields and strips domain from URL path fields. */
export function flattenMediaFields(
  item: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    if (MEDIA_KEYS.has(key)) {
      out[key] = flattenMedia(value);
    } else if (URL_PATH_KEYS.has(key)) {
      out[key] = toLocalPath(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
