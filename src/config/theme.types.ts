// Each token maps 1:1 to a CSS custom property; changing tokens resyles the entire UI.
export interface ThemeTokens {
  accent: string;
  accentDark: string;
  text: string;
  muted: string;
  mutedBg: string;
  border: string;
  pageBg: string;
  surfaceBg: string;
  shadow: string;
  fontFamily: string;
  headingFamily: string;
}

/** Publisher config entry used by the registry and renderer. */
export interface PublisherConfig {
  key: string;
  name: string;
  tagline: string;
  /** BCP-47 language tag for the <html lang> attribute. Defaults to "en". */
  lang?: string;
  cdsPublisherId: string;
  longLogo?: string;
  shortLogo?: string;
  theme: ThemeTokens;
}
