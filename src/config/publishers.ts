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
  // Logos, navigation, and footer come from the CDS APIs (publisherApi / navApi /
  // footerApi) — not hardcoded here.
  theme: {
    // Broadcast news: clean white/gray, red accent (urgency as primary).
    accent: "#CC0000",
    accentDark: "#990000",
    accentSoft: "#fff0f0",
    text: "#111111",
    ink2: "#333333",
    muted: "#666666",
    mutedBg: "#f0f0f0",
    border: "#e0e0e0",
    pageBg: "#f2f2f2",
    surfaceBg: "#ffffff",
    shadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
    fontFamily: SANS_STACK,
    headingFamily: SANS_STACK,
  },
};

/** All known publishers keyed by their stable key. */
export const PUBLISHERS: Record<string, PublisherConfig> = {
  [CRICTODAY.key]: CRICTODAY,
};

/** Default publisher when the configured key is unknown. */
const DEFAULT_PUBLISHER = CRICTODAY;

/** Returns the active publisher config. */
export function getActivePublisher(): PublisherConfig {
  return PUBLISHERS[ACTIVE_PUBLISHER_KEY] ?? DEFAULT_PUBLISHER;
}
