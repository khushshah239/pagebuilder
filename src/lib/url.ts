/**
 * Convert an absolute CDS URL (e.g. a category's `absolute_url`,
 * `https://crictoday-beta.publive.io/cricket/news`) into an internal path
 * (`/cricket/news`) for client-side navigation. Already-relative values pass
 * through; blank input yields "".
 */
export function toInternalPath(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}
