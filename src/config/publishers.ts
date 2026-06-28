// Publisher registry — add a new entry here to onboard a new publisher.
import { ACTIVE_PUBLISHER_KEY } from "./env";
import type { PublisherConfig } from "./theme.types";

// var(--font-inter) is injected by next/font/google at build time (self-hosted,
// no external request). The named families are retained as fallbacks.
const SANS_STACK =
  'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const CRICTODAY: PublisherConfig = {
  key: "crictoday",
  name: "Crictoday",
  tagline: "Cricket News, Live Scores, Features & Opinion",
  cdsPublisherId: "4027",
  // Fallback logos — preferred source is fetchPublisherData() in publisherApi.ts.
  longLogo: "https://img-cdn.publive.online/crictoday/media/agency_attachments/2026/05/15/2026-05-15t051127404z-crictoday-dark-2048-2026-05-15-10-41-27.png",
  shortLogo: "https://img-cdn.publive.online/crictoday/media/agency_attachments/2026/01/08/2026-01-08t095049450z-ct-640x480-logo-sq-photoroom-cric-today-2026-01-08-15-20-49.png",
  theme: {
    // Modern Editorial: warm-neutral paper, deep pitch-green accent.
    // Red is reserved for genuine urgency only (--pb-urgent).
    accent: "#1f6f54",
    accentDark: "#14533d",
    accentSoft: "#eaf2ee",
    text: "#1a1a18",
    ink2: "#3d3d39",
    muted: "#6b6a64",
    mutedBg: "#f3f1ec",
    border: "#e7e3db",
    pageBg: "#faf8f4",
    surfaceBg: "#ffffff",
    shadow: "0 4px 12px rgba(26, 26, 24, 0.06), 0 2px 4px rgba(26, 26, 24, 0.04)",
    fontFamily: SANS_STACK,
    headingFamily: SANS_STACK,
  },
};

const METROPOST: PublisherConfig = {
  key: "metropost",
  name: "Metro Post",
  tagline: "Independent Journalism for the City",
  // FIXME: "4027" is Crictoday's ID — Metro Post is not yet onboarded on CDS.
  // Setting NEXT_PUBLIC_PUBLISHER_KEY=metropost in production will silently serve
  // Crictoday content. Replace with the real CDS publisher ID before enabling.
  cdsPublisherId: "4027",
  theme: {
    // Modern Editorial: ink-navy accent on warm-neutral paper.
    accent: "#1c2a3a",
    accentDark: "#14202e",
    accentSoft: "#eef1f6",
    text: "#15171b",
    ink2: "#3a3f47",
    muted: "#5f6873",
    mutedBg: "#f0f2f6",
    border: "#e3e6ec",
    pageBg: "#fafbfc",
    surfaceBg: "#ffffff",
    shadow: "0 4px 12px rgba(16, 32, 78, 0.06), 0 2px 4px rgba(16, 32, 78, 0.04)",
    fontFamily: SANS_STACK,
    headingFamily: SANS_STACK,
  },
};

/** All known publishers keyed by their stable key. */
export const PUBLISHERS: Record<string, PublisherConfig> = {
  [CRICTODAY.key]: CRICTODAY,
  [METROPOST.key]: METROPOST,
};

/** Default publisher when the configured key is unknown. */
const DEFAULT_PUBLISHER = CRICTODAY;

/** Returns the active publisher config. */
export function getActivePublisher(): PublisherConfig {
  return PUBLISHERS[ACTIVE_PUBLISHER_KEY] ?? DEFAULT_PUBLISHER;
}
