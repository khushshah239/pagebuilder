// Publisher registry — add a new entry here to onboard a new publisher.
import { ACTIVE_PUBLISHER_KEY } from "./env";
import type { PublisherConfig } from "./theme.types";

// var(--font-inter) / var(--font-playfair) are injected by next/font/google at build time
// (self-hosted, no external request). The named families are retained as fallbacks.
const SANS_STACK =
  'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const SERIF_STACK =
  'var(--font-playfair), "Playfair Display", Georgia, "Times New Roman", serif';

const CRICTODAY: PublisherConfig = {
  key: "crictoday",
  name: "Crictoday",
  tagline: "Cricket News, Live Scores, Features & Opinion",
  cdsPublisherId: "4027",
  // Fallback logos — preferred source is fetchPublisherData() in publisherApi.ts.
  longLogo: "https://img-cdn.publive.online/crictoday/media/agency_attachments/2026/05/15/2026-05-15t051127404z-crictoday-dark-2048-2026-05-15-10-41-27.png",
  shortLogo: "https://img-cdn.publive.online/crictoday/media/agency_attachments/2026/01/08/2026-01-08t095049450z-ct-640x480-logo-sq-photoroom-cric-today-2026-01-08-15-20-49.png",
  theme: {
    // CHRONICLE "Standard Sentinel" design system (Design/DESIGN.md):
    // dark header, soft off-white canvas, red reserved for urgent signals.
    accent: "#ba0035",
    accentDark: "#920028",
    text: "#1b1b1d",
    muted: "#45464d",
    mutedBg: "#f0edef",
    border: "#c6c6cd",
    pageBg: "#fcf8fa",
    surfaceBg: "#ffffff",
    shadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
    fontFamily: SANS_STACK,
    headingFamily: SERIF_STACK,
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
