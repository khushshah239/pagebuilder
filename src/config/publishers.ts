/**
 * Publisher registry.
 *
 * Two publishers share the exact same component system and resolver; they differ
 * only in the data here — CDS publisher id, navigation, and branding tokens.
 * This is the answer to "how does publisher A differ from publisher B": it is a
 * config entry, not a code fork.
 */
import { ACTIVE_PUBLISHER_KEY } from "./env";
import type { PublisherConfig } from "./theme.types";

/** Font stacks reused across publishers. */
const SANS_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const SERIF_STACK = 'Georgia, "Times New Roman", Times, serif';

const CRICTODAY: PublisherConfig = {
  key: "crictoday",
  name: "Crictoday",
  tagline: "Cricket News, Live Scores, Features & Opinion",
  cdsPublisherId: "4027",
  // Fallback logos — used only when the CDS /publisher/ API returns no logo fields.
  // Preferred source is fetchPublisherData() in publisherApi.ts.
  longLogo: "https://img-cdn.publive.online/crictoday/media/agency_attachments/2026/05/15/2026-05-15t051127404z-crictoday-dark-2048-2026-05-15-10-41-27.png",
  shortLogo: "https://img-cdn.publive.online/crictoday/media/agency_attachments/2026/01/08/2026-01-08t095049450z-ct-640x480-logo-sq-photoroom-cric-today-2026-01-08-15-20-49.png",
  theme: {
    accent: "#e11d2e",
    accentDark: "#b8172a",
    text: "#15171a",
    muted: "#6b7280",
    mutedBg: "#eef0f2",
    border: "#e7e9ec",
    pageBg: "#ffffff",
    surfaceBg: "#ffffff",
    shadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
    fontFamily: SANS_STACK,
    headingFamily: SANS_STACK,
  },
};

const METROPOST: PublisherConfig = {
  key: "metropost",
  name: "Metro Post",
  tagline: "Independent Journalism for the City",
  // TODO: replace with the real CDS publisher ID when Metro Post is onboarded.
  cdsPublisherId: "4027",
  theme: {
    accent: "#1a4fd6",
    accentDark: "#143ca8",
    text: "#101418",
    muted: "#5f6873",
    mutedBg: "#eef1f6",
    border: "#dce1e9",
    pageBg: "#f7f8fa",
    surfaceBg: "#ffffff",
    shadow: "0 16px 34px rgba(16, 32, 78, 0.10)",
    fontFamily: SANS_STACK,
    headingFamily: SERIF_STACK,
  },
};

/** All known publishers, keyed by their stable `key`. */
export const PUBLISHERS: Record<string, PublisherConfig> = {
  [CRICTODAY.key]: CRICTODAY,
  [METROPOST.key]: METROPOST,
};

/** Fallback publisher used when the configured key is unknown. */
const DEFAULT_PUBLISHER = CRICTODAY;

/** Resolve the publisher selected by `NEXT_PUBLIC_PUBLISHER_KEY`. */
export function getActivePublisher(): PublisherConfig {
  return PUBLISHERS[ACTIVE_PUBLISHER_KEY] ?? DEFAULT_PUBLISHER;
}
