"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/organisms/article/ArticleBody.module.scss";

const COLLAPSED_MAX_HEIGHT = 640;
const COLLAPSE_BUFFER = 80;

/** Client wrapper that adds collapse/expand to the server-rendered article body. */
export function ArticleBodyCollapse({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [collapsible, setCollapsible] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setCollapsible(el.scrollHeight > COLLAPSED_MAX_HEIGHT + COLLAPSE_BUFFER);
  }, []);

  const isCollapsed = collapsible && !expanded;

  return (
    <>
      <div
        ref={contentRef}
        style={isCollapsed ? { maxHeight: COLLAPSED_MAX_HEIGHT, overflow: "hidden" } : undefined}
      >
        {children}
      </div>
      {collapsible && (
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            onClick={() => setExpanded((o) => !o)}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        </div>
      )}
    </>
  );
}
