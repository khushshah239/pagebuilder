"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InfiniteArticleFeed } from "@/organisms/section/InfiniteArticleFeed";
import Link from "next/link";
import type { SectionFeedArticle } from "@/types/section/organism.types";
import styles from "@/styles/components/Pagination.module.css";

const CARDS_PER_PAGE = 10;

interface SectionFeedProps {
  articles: SectionFeedArticle[];
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const windowStart = Math.max(1, page - 2);
  const pageNumbers: number[] = [];
  for (let n = windowStart; n <= totalPages; n++) pageNumbers.push(n);
  return (
    <nav className={styles.pagination} aria-label="Section pages">
      <Link
        href={`?page=${page - 1}`}
        className={`${styles.nav} ${page <= 1 ? styles.disabled : ""}`}
        aria-disabled={page <= 1}
      >
        ‹ Prev
      </Link>
      {pageNumbers.map((n) => (
        <Link
          key={n}
          href={`?page=${n}`}
          className={`${styles.page} ${n === page ? styles.active : ""}`}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </Link>
      ))}
      <Link
        href={`?page=${page + 1}`}
        className={`${styles.nav} ${page >= totalPages ? styles.disabled : ""}`}
        aria-disabled={page >= totalPages}
      >
        Next ›
      </Link>
    </nav>
  );
}

function FeedInner({ articles }: SectionFeedProps) {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(articles.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * CARDS_PER_PAGE;
  const visible = articles.slice(start, start + CARDS_PER_PAGE);
  return (
    <div>
      <InfiniteArticleFeed identifier="section-feed" feed_articles={visible} />
      <Pagination page={currentPage} totalPages={totalPages} />
    </div>
  );
}

export function SectionFeed({ articles }: SectionFeedProps) {
  return (
    <Suspense fallback={
      <div>
        <InfiniteArticleFeed identifier="section-feed" feed_articles={articles.slice(0, CARDS_PER_PAGE)} />
      </div>
    }>
      <FeedInner articles={articles} />
    </Suspense>
  );
}
