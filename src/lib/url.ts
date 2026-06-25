// Converts an absolute CDS URL to an internal pathname; relative values pass through.
export function toInternalPath(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}
