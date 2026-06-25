"use client";

import type { ShareBarProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ShareBar.module.scss";

/**
 * Build a platform share URL. If the CMS URL ends with `=` or `?` it is a
 * share endpoint — append the encoded article URL. Otherwise return as-is.
 */
function buildHref(base: string, articleUrl: string): string {
  if (!base) return "";
  if (base.endsWith("=") || base.endsWith("?")) {
    return base + encodeURIComponent(articleUrl);
  }
  return base;
}

/** Social sharing action bar — one button per platform. */
export function ShareBar({ identifier, label, share_buttons = [] }: ShareBarProps) {
  const articleUrl = typeof window !== "undefined" ? window.location.href : "";

  if (share_buttons.length === 0) return null;

  // Try the Web Share API first (opens native share sheet on mobile —
  // includes Instagram, WhatsApp, etc. without needing platform URLs).
  // Falls back to window.open with the platform URL on desktop.
  function handleShare(
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    fallbackHref: string
  ) {
    if (typeof navigator !== "undefined" && navigator.share) {
      e.preventDefault();
      navigator
        .share({ title: document.title, url: articleUrl || window.location.href })
        .catch(() => {
          if (fallbackHref) window.open(fallbackHref, "_blank", "noopener,noreferrer");
        });
    }
    // No navigator.share → <a> navigates to fallbackHref normally.
  }

  return (
    <div className={styles.bar} data-organism={identifier}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div className={styles.buttons}>
        {share_buttons.map((button, index) => {
          const href = buildHref(button.url ?? "", articleUrl);
          const key = `${identifier}-share-${index}`;
          const content = button.icon ? (
            <img className={styles.icon} src={button.icon} alt={button.platform_name} />
          ) : (
            <span className={styles.fallbackInitial}>
              {button.platform_name?.[0]?.toUpperCase() ?? "S"}
            </span>
          );

          // Buttons with a platform URL render as <a> (desktop fallback works).
          // Buttons without a URL (e.g. Instagram profile not set) render as
          // <button> that still triggers the native share sheet on mobile.
          return href ? (
            <a
              key={key}
              href={href}
              className={styles.button}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${button.platform_name}`}
              onClick={(e) => handleShare(e, href)}
            >
              {content}
            </a>
          ) : (
            <button
              key={key}
              type="button"
              className={styles.button}
              aria-label={`Share on ${button.platform_name}`}
              onClick={(e) => handleShare(e, "")}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
