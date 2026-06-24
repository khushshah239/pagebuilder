/**
 * Single source of truth for environment configuration.
 *
 * Every other module reads connection settings and credentials from here rather
 * than touching `process.env` directly, so defaults and parsing live in one place.
 */

/** CDS host, e.g. `https://cds-beta.thepublive.com`. */
export const CDS_BASE_URL =
  process.env.NEXT_PUBLIC_CDS_BASE_URL ?? "https://cds-beta.thepublive.com";

/** Numeric publisher id used to address the CDS, e.g. `4027`. */
export const CDS_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_CDS_PUBLISHER_ID ?? "4027";

/** Publive CMS credentials. Server-only — never exposed to the browser bundle. */
const CDS_USERNAME = process.env.CDS_USERNAME ?? "";
const CDS_PASSWORD = process.env.CDS_PASSWORD ?? "";

/** Key of the active publisher in the publisher registry (see `publishers.ts`). */
export const ACTIVE_PUBLISHER_KEY =
  process.env.NEXT_PUBLIC_PUBLISHER_KEY ?? "crictoday";

/**
 * Build the HTTP Basic `Authorization` header from the configured credentials.
 * Returns an empty string when no credentials are set, so unauthenticated
 * endpoints keep working unchanged.
 */
export function buildAuthorizationHeader(): string {
  if (!CDS_USERNAME && !CDS_PASSWORD) return "";
  const encoded = Buffer.from(`${CDS_USERNAME}:${CDS_PASSWORD}`).toString("base64");
  return `Basic ${encoded}`;
}
