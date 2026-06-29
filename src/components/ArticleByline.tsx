import { AuthorLink } from "@/components/AuthorLink";
import { formatPublishedDateTime } from "@/lib/date";
import styles from "@/styles/components/ArticleByline.module.css";

function CalendarIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

/**
 * Article byline: "By {author}" followed by a meta line with a calendar icon +
 * published date/time. Colours inherit from context (white on the hero overlay,
 * dark on white cards). Renders nothing when there is no author or date.
 *
 * The author name links to the author page when `authorUrl` is supplied (the
 * contributor's `absolute_url`, resolved to an internal path). Cards must use
 * the stretched-overlay-link pattern so this nested link sits above the article
 * overlay (its `.author` class provides the stacking context) rather than being
 * wrapped inside the card's anchor.
 */
export function ArticleByline({
  authorName,
  authorUrl,
  publishedAt,
}: {
  authorName?: string;
  authorUrl?: string;
  publishedAt?: string;
}) {
  // CDS may send an ISO timestamp (formatted to "Mar 07, 2026 11:23 IST") or an
  // already-display-ready string (e.g. "17/06/2026 15:58"); fall back to the raw
  // value when it isn't ISO so a pre-formatted date still shows.
  const dateTime = formatPublishedDateTime(publishedAt) || publishedAt || "";
  if (!authorName && !dateTime) return null;

  return (
    <div className={styles.byline}>
      {authorName ? (
        <div className={styles.authorLine}>
          <span className={styles.by}>By</span>{" "}
          <AuthorLink
            name={authorName}
            url={authorUrl}
            className={styles.author}
          />
        </div>
      ) : null}

      {dateTime ? (
        <div className={styles.metaLine}>
          <span className={styles.metaItem}>
            <CalendarIcon />
            {dateTime}
          </span>
        </div>
      ) : null}
    </div>
  );
}
