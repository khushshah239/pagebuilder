"use client";

import { useState, useSyncExternalStore } from "react";
import { PbImage } from "@/components/PbImage";
import type { ShareBarProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ShareBar.module.css";

/** Chain-link glyph for the "copy link" action — no CMS icon for this one. */
function LinkIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.9 12a5.1 5.1 0 0 1 5.1-5.1h3v1.8h-3a3.3 3.3 0 0 0 0 6.6h3V17h-3A5.1 5.1 0 0 1 3.9 12Zm6.6.9v-1.8h3v1.8h-3Zm2.5-5.9h3a5.1 5.1 0 0 1 0 10.2h-3v-1.8h3a3.3 3.3 0 0 0 0-6.6h-3V7Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.5-1.46h1.6V4.14C15.9 4.06 15.07 4 14.08 4c-2.06 0-3.47 1.26-3.47 3.56v1.64H8v3h2.6V21h2.9Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6 10.6 20 3.5h-1.9l-5.6 6.2-4.5-6.2H3l6.7 9.2L3 21.5h1.9l5.9-6.5 4.7 6.5H21l-7.4-10.9Zm-2.1 2.3-.7-.9-5.4-7.4h2.1l4.3 6 .7.9 5.7 7.8h-2.1l-4.6-6.4Z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.3A9 9 0 1 0 12 3Zm0 1.8a7.2 7.2 0 0 1 6 11.2l-.2.4.6 2.1-2.2-.6-.4.2a7.2 7.2 0 1 1-3.8-13.3Zm-3 3.6c-.2 0-.5 0-.7.3-.2.3-.9.8-.9 2s.9 2.4 1 2.5c.1.2 1.7 2.7 4.2 3.7 2 .8 2.4.6 2.9.6.4 0 1.4-.6 1.6-1.1.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3l-1.6-.8c-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4.6c2.5 0 2.8 0 3.8.1 1 0 1.5.2 1.9.4.5.2.8.4 1.1.8.4.3.6.6.8 1.1.2.4.3.9.4 1.9.1 1 .1 1.3.1 3.8s0 2.8-.1 3.8c0 1-.2 1.5-.4 1.9-.2.5-.4.8-.8 1.1-.3.4-.6.6-1.1.8-.4.2-.9.3-1.9.4-1 .1-1.3.1-3.8.1s-2.8 0-3.8-.1c-1 0-1.5-.2-1.9-.4-.5-.2-.8-.4-1.1-.8-.4-.3-.6-.6-.8-1.1-.2-.4-.3-.9-.4-1.9-.1-1-.1-1.3-.1-3.8s0-2.8.1-3.8c0-1 .2-1.5.4-1.9.2-.5.4-.8.8-1.1.3-.4.6-.6 1.1-.8.4-.2.9-.3 1.9-.4 1-.1 1.3-.1 3.8-.1ZM12 3c-2.6 0-2.9 0-3.9.1-1 .1-1.7.2-2.3.5-.6.2-1.2.6-1.7 1.1-.5.5-.9 1-1.1 1.7-.3.6-.4 1.3-.5 2.3C2.4 9.7 2.4 10 2.4 12.6s0 2.9.1 3.9c.1 1 .2 1.7.5 2.3.2.6.6 1.2 1.1 1.7.5.5 1 .9 1.7 1.1.6.3 1.3.4 2.3.5 1 .1 1.3.1 3.9.1s2.9 0 3.9-.1c1-.1 1.7-.2 2.3-.5.6-.2 1.2-.6 1.7-1.1.5-.5.9-1 1.1-1.7.3-.6.4-1.3.5-2.3.1-1 .1-1.3.1-3.9s0-2.9-.1-3.9c-.1-1-.2-1.7-.5-2.3-.2-.6-.6-1.2-1.1-1.7-.5-.5-1-.9-1.7-1.1-.6-.3-1.3-.4-2.3-.5C14.9 3 14.6 3 12 3Zm0 4.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-7.8a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z" />
    </svg>
  );
}

/** CDS-provided icon images arrive brand-coloured with opaque backgrounds, so
 * they can't be recoloured with a CSS filter to match the solid-circle button
 * style — render a flat SVG instead. Matching is typo-tolerant (CMS entries
 * are hand-typed and inconsistent — e.g. "Whatshapp", "insagram"). */
function platformIcon(platformName: string | undefined) {
  const name = (platformName ?? "").toLowerCase();
  if (name.includes("facebook") || name.includes("fb")) return <FacebookIcon />;
  if (name.includes("twitter") || name === "x" || name.includes("/x")) return <XIcon />;
  if (name.includes("whats")) return <WhatsappIcon />;
  if (name.includes("insta") || name.includes("insa")) return <InstagramIcon />;
  return null;
}

/** Masks CMS typos like "Whatshapp" or "insagram" in the visible aria-label;
 * falls back to the raw CMS value for anything unrecognized. */
function platformDisplayName(platformName: string | undefined): string {
  const name = (platformName ?? "").toLowerCase();
  if (name.includes("facebook") || name.includes("fb")) return "Facebook";
  if (name.includes("twitter") || name === "x" || name.includes("/x")) return "X";
  if (name.includes("whats")) return "WhatsApp";
  if (name.includes("insta") || name.includes("insa")) return "Instagram";
  return platformName ?? "this platform";
}

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

/**
 * Fallback share URLs used when the CMS doesn't supply a working
 * `button.platform_link`. Instagram has no public web share intent, so it
 * falls through to the native share sheet only.
 */
function platformShareUrl(
  platformName: string | undefined,
  articleUrl: string,
  title: string
): string {
  const name = (platformName ?? "").toLowerCase();
  const url = encodeURIComponent(articleUrl);
  const text = encodeURIComponent(title);
  if (name.includes("facebook") || name.includes("fb")) {
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  }
  if (name.includes("twitter") || name === "x" || name.includes("/x")) {
    return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  }
  if (name.includes("whats")) {
    return `https://wa.me/?text=${text}%20${url}`;
  }
  return "";
}

/** Social sharing action bar — one button per platform. */
export function ShareBar({ identifier, label, share_buttons = [] }: ShareBarProps) {
  // The URL/title only exist in the browser. useSyncExternalStore returns the
  // SSR snapshot ("") for the server render and the initial client render
  // (keeping them identical for hydration), then swaps in the real value.
  const noopSubscribe = () => () => {};
  const articleUrl = useSyncExternalStore(
    noopSubscribe,
    () => window.location.href,
    () => ""
  );
  const pageTitle = useSyncExternalStore(
    noopSubscribe,
    () => document.title,
    () => ""
  );
  const [copied, setCopied] = useState(false);

  if (share_buttons.length === 0) return null;

  async function handleCopyLink() {
    const url = articleUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  // Only for buttons with no platform-specific link (e.g. Instagram, which
  // has no web share-intent URL) — opens the native OS share sheet instead.
  function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: pageTitle, url: articleUrl || window.location.href })
        .catch(() => {});
    }
  }

  return (
    <div className={styles.bar} data-organism={identifier}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div className={styles.buttons}>
        {share_buttons.map((button, index) => {
          const href =
            buildHref(button.platform_link ?? "", articleUrl) ||
            platformShareUrl(button.platform_name, articleUrl, pageTitle);
          const key = `${identifier}-share-${index}`;
          const displayName = platformDisplayName(button.platform_name);
          const content = platformIcon(button.platform_name) ?? (
            button.icon ? (
              <PbImage
                className={styles.icon}
                src={button.icon}
                alt={button.platform_name}
                fixed={{ width: 24, height: 24 }}
                placeholder="none"
              />
            ) : (
              <span className={styles.fallbackInitial}>
                {button.platform_name?.[0]?.toUpperCase() ?? "S"}
              </span>
            )
          );

          return href ? (
            <a
              key={key}
              href={href}
              className={styles.button}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${displayName}`}
            >
              {content}
            </a>
          ) : (
            <button
              key={key}
              type="button"
              className={styles.button}
              aria-label={`Share on ${displayName}`}
              onClick={handleNativeShare}
            >
              {content}
            </button>
          );
        })}
        <span className={styles.buttonWrap}>
          <button
            type="button"
            className={styles.button}
            aria-label="Copy link"
            onClick={handleCopyLink}
          >
            <LinkIcon />
          </button>
          {copied ? <span className={styles.copied}>Copied!</span> : null}
        </span>
      </div>
    </div>
  );
}
