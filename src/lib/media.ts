/** Prop keys whose CDS values may be media objects (not plain URL strings). */
export const MEDIA_KEYS = new Set([
  "image",
  "thumbnail",
  "background_image",
  "cover_image",
  "avatar",
  "logo",
  "icon",
]);

/** Extracts URL string from a CDS media object, or passes primitives through. */
export function flattenMedia(value: unknown): string {
  if (value && typeof value === "object") {
    const media = value as Record<string, unknown>;
    return (media.absolute_path as string) ?? (media.path as string) ?? "";
  }
  return (value as string) ?? "";
}

/** Flattens media-typed fields on an item to plain URL strings. */
export function flattenMediaFields(
  item: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    out[key] = MEDIA_KEYS.has(key) ? flattenMedia(value) : value;
  }
  return out;
}

// Rewrites the CDN `fit-in/<w>x<h>` segment to the requested dimensions.
export function widenCdnImage(url: string, dimensions = "1280x720"): string {
  if (!url) return url;
  return url.replace(/\/fit-in\/\d+x\d+\//, `/fit-in/${dimensions}/`);
}

// Returns CDN URL sized for thumbnail cards: 568x340 desktop, 360x220 mobile.
// Uses srcset so browser picks the right size automatically.
export function cdnImageSrcSet(url: string): { src: string; srcSet: string } {
  return {
    src: widenCdnImage(url, "568x340"),
    srcSet: `${widenCdnImage(url, "360x220")} 360w, ${widenCdnImage(url, "568x340")} 568w`,
  };
}
