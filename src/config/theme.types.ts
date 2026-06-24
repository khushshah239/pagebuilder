/**
 * Theme contract shared by every publisher.
 *
 * Each token maps 1:1 to a CSS custom property consumed by the organism
 * stylesheets (see `theme/cssVariables.ts`). Because all organisms read these
 * variables, a publisher restyles the entire UI by changing tokens only — no
 * component or stylesheet edits.
 */
export interface ThemeTokens {
  /** Primary brand colour — section labels, active states, accents. */
  accent: string;
  /** Darker accent for hovers / gradients. */
  accentDark: string;
  /** Default body text colour. */
  text: string;
  /** Muted text — bylines, timestamps, captions. */
  muted: string;
  /** Muted surface — chips, skeletons, subtle fills. */
  mutedBg: string;
  /** Hairline borders and dividers. */
  border: string;
  /** Page background. */
  pageBg: string;
  /** Card / surface background. */
  surfaceBg: string;
  /** Standard elevation shadow. */
  shadow: string;
  /** Base font stack for the publisher. */
  fontFamily: string;
  /** Display/heading font stack. */
  headingFamily: string;
}

/** Everything needed to render a publisher's site. */
export interface PublisherConfig {
  /** Stable key used to select this publisher (matches NEXT_PUBLIC_PUBLISHER_KEY). */
  key: string;
  /** Human-readable publisher name shown in the masthead and metadata. */
  name: string;
  /** Short tagline shown in the masthead / document description. */
  tagline: string;
  /** CDS publisher id this site reads from. */
  cdsPublisherId: string;
  /** Wide/horizontal logo URL (from CDS `long_logo`). Used in the masthead. */
  longLogo?: string;
  /** Square logo URL (from CDS `short_logo`). Used as favicon / small brand mark. */
  shortLogo?: string;
  /** Branding tokens applied as CSS variables. */
  theme: ThemeTokens;
}
