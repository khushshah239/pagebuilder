"use client";

import { useEffect, useRef, useState } from "react";
import type { ArticleBodyProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ArticleBody.module.scss";

/** A body taller than this (px) collapses behind a "Read more" toggle. */
const COLLAPSED_MAX_HEIGHT = 640;
/** Only collapse when the body meaningfully exceeds the cap, not by a sliver. */
const COLLAPSE_BUFFER = 80;

/**
 * Full rich-text article body. The CDS `body` is trusted publisher HTML, so it
 * is rendered via `dangerouslySetInnerHTML` inside a styled prose container.
 *
 * Long articles are collapsed to {@link COLLAPSED_MAX_HEIGHT} behind a fade with
 * a "Read more" button; expanding reveals the full article. Short articles that
 * fit are shown in full with no toggle. The full HTML is always in the DOM (just
 * visually clipped while collapsed), so it stays selectable and crawlable.
 */
export function ArticleBody({ identifier, body }: ArticleBodyProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  // Assume collapsible until measured so the server and first client render
  // agree (no hydration mismatch); short bodies un-collapse after measuring.
  const [collapsible, setCollapsible] = useState(true);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    setCollapsible(content.scrollHeight > COLLAPSED_MAX_HEIGHT + COLLAPSE_BUFFER);
  }, [body]);

  if (!body) return null;

  const isCollapsed = collapsible && !expanded;

  return (
    <div data-organism={identifier}>
      <div
        ref={contentRef}
        className={`${styles.body} ${isCollapsed ? styles.collapsed : ""}`}
        style={isCollapsed ? { maxHeight: COLLAPSED_MAX_HEIGHT } : undefined}
        dangerouslySetInnerHTML={{ __html: body }}
      />
      {collapsible ? (
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
