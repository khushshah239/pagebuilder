/** CDS host. */
export const CDS_BASE_URL =
  process.env.NEXT_PUBLIC_CDS_BASE_URL ?? "https://cds-beta.thepublive.com";

/** Numeric publisher id for CDS requests. */
export const CDS_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_CDS_PUBLISHER_ID ?? "4027";

/** CMS credentials — server-only, never exposed to the browser. */
const CDS_USERNAME = process.env.CDS_USERNAME ?? "";
const CDS_PASSWORD = process.env.CDS_PASSWORD ?? "";

/** Key of the active publisher in the registry. */
export const ACTIVE_PUBLISHER_KEY =
  process.env.NEXT_PUBLIC_PUBLISHER_KEY ?? "crictoday";

/** Returns a Basic Authorization header string, or "" when no credentials are set. */
export function buildAuthorizationHeader(): string {
  if (!CDS_USERNAME && !CDS_PASSWORD) return "";
  const encoded = Buffer.from(`${CDS_USERNAME}:${CDS_PASSWORD}`).toString("base64");
  return `Basic ${encoded}`;
}
