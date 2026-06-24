/** Prop keys whose values may arrive as raw CDS media objects needing flattening. */
export const MEDIA_KEYS = new Set([
  "image",
  "thumbnail",
  "background_image",
  "cover_image",
  "avatar",
  "logo",
  "icon",
]);

/** Reduce a CDS media object to its URL string; pass primitives through. */
export function flattenMedia(value: unknown): string {
  if (value && typeof value === "object") {
    const media = value as Record<string, unknown>;
    return (media.absolute_path as string) ?? (media.path as string) ?? "";
  }
  return (value as string) ?? "";
}

/** Flatten any media-typed keys on an item to plain URL strings. */
export function flattenMediaFields(
  item: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    out[key] = MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
  }
  return out;
}

/**
 * Publive CDN images carry a `fit-in/<w>x<h>` resize segment. Rewrite it to a
 * larger size so big surfaces (e.g. the hero) request a sharper image instead of
 * upscaling the default thumbnail. URLs without that segment pass through.
 */
export function widenCdnImage(url: string, dimensions = "1280x720"): string {
  if (!url) return url;
  return url.replace(/\/fit-in\/\d+x\d+\//, `/fit-in/${dimensions}/`);
}
