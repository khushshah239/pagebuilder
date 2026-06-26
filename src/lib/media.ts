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

// Rewrites the CDN `fit-in/<w>x<h>` segment to the requested dimensions.
// Returns the original URL unchanged if the CDN pattern isn't present.
export function widenCdnImage(url: string, dimensions = "1280x720"): string {
  if (!url) return url;
  const resized = url.replace(/\/fit-in\/\d+x\d+\//, `/fit-in/${dimensions}/`);
  if (resized === url && process.env.NODE_ENV === "development") {
    console.warn("[media] widenCdnImage: URL has no /fit-in/ segment, returning original:", url);
  }
  return resized;
}

// Returns CDN URL sized for thumbnail cards: 568x340 desktop, 360x220 mobile.
// Uses srcset so browser picks the right size automatically.
export function cdnImageSrcSet(url: string): { src: string; srcSet: string } {
  return {
    src: widenCdnImage(url, "568x340"),
    srcSet: `${widenCdnImage(url, "360x220")} 360w, ${widenCdnImage(url, "568x340")} 568w`,
  };
}
