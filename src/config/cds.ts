// Central CDS configuration. Onboarding a new publisher changes only these
// values (base URL + publisher id + auth), never the components.

export const CDS_BASE_URL =
  process.env.NEXT_PUBLIC_CDS_BASE_URL ?? "https://cds-beta.thepublive.com";

export const CDS_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_CDS_PUBLISHER_ID ?? "4027";

/** Authorization header sent with every CDS request (empty when not required). */
export const CDS_AUTH_HEADER = process.env.CDS_AUTH_HEADER ?? "";

/** The homepage CustomEntity is addressed by its legacy URL. */
export const HOMEPAGE_LEGACY_URL = "/homepages/homepage";

/** ISR window: how long (seconds) the homepage route stays cached. */
export const REVALIDATE_SECONDS = 60;
