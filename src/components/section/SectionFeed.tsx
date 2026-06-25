"use client";

import { useState } from "react";
import { InfiniteArticleFeed } from "@/organisms/section/InfiniteArticleFeed";
import { Pagination } from "./Pagination";
import type { SectionFeedArticle } from "@/types/section/organism.types";

/** Cards per page. */
const CARDS_PER_PAGE = 10;

interface SectionFeedProps {
  articles: SectionFeedArticle[];
}

/** Renders bound feed articles with client-side pagination when count > CARDS_PER_PAGE. */
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
