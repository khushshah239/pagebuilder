"use client";

import { useState } from "react";
import { InfiniteArticleFeed } from "@/organisms/section/InfiniteArticleFeed";
import { Pagination } from "./Pagination";
import type { SectionFeedArticle } from "@/types/section/organism.types";

/** Cards per page — two rows of five. */
const CARDS_PER_PAGE = 10;

interface SectionFeedProps {
  /** Every article the `section-feed` binding resolved — the whole feed. */
  articles: SectionFeedArticle[];
}

/**
 * Renders the bound feed articles, paginating client-side only when the binding
 * maps more than one page's worth. The feed is exactly what the binding defines
 * — it does not walk the rest of the category — so there is a "next" page only
 * when the editor bound more than {@link CARDS_PER_PAGE} articles.
 */
export function SectionFeed({ articles }: SectionFeedProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(articles.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * CARDS_PER_PAGE;
  const visible = articles.slice(start, start + CARDS_PER_PAGE);

  return (
    <div>
      <InfiniteArticleFeed identifier="section-feed" feed_articles={visible} />
      {totalPages > 1 ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
