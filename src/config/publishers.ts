import { ACTIVE_PUBLISHER_KEY } from "./env";
import type { PublisherConfig } from "./theme.types";

// var(--font-inter) is injected by next/font/google at build time (self-hosted,
// no external request). The named families are retained as fallbacks.
const SANS_STACK =
  'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const SORA_STACK =
  'var(--font-sora), Sora, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const CRICTODAY: PublisherConfig = {
  key: "crictoday",
  name: "CricToday",
  cdsPublisherId: "4027",
  // Logos, navigation, and footer come from the CDS APIs (publisherApi / navApi /
  // footerApi) — not hardcoded here.
  theme: {
    accent: "#c0392b",
    accentDark: "#962d22",
    accentSoft: "#fdf3f2",
    text: "#1a2332",
    ink2: "#334155",
    muted: "#6b7c93",
    mutedBg: "#f0f4f8",
    border: "#e2e8f0",
    pageBg: "#f5f7fa",
    surfaceBg: "#ffffff",
    shadow: "0 1px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    fontFamily: SANS_STACK,
    headingFamily: SORA_STACK,
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
