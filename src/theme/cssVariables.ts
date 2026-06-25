import type { CSSProperties } from "react";
import type { ThemeTokens } from "@/config/theme.types";

/**
 * Map a publisher's theme tokens to the `--pb-*` CSS custom properties that the
 * organism stylesheets consume. Applied as an inline style on the page root so
 * the whole UI restyles per publisher with zero component changes.
 */
export function themeToCssVariables(theme: ThemeTokens): CSSProperties {
  return {
    "--pb-accent": theme.accent,
    "--pb-accent-dark": theme.accentDark,
    "--pb-text": theme.text,
    "--pb-muted": theme.muted,
    "--pb-muted-bg": theme.mutedBg,
    "--pb-border": theme.border,
    "--pb-page-bg": theme.pageBg,
    "--pb-surface-bg": theme.surfaceBg,
    "--pb-shadow": theme.shadow,
    "--pb-font": theme.fontFamily,
    "--pb-heading-font": theme.headingFamily,
  } as CSSProperties;
}
