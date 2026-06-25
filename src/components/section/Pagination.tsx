"use client";

import styles from "@/styles/components/Pagination.module.css";

interface PaginationProps {
  page: number;
  /** Total number of pages, when known (client-side over a fixed set). */
  totalPages?: number;
  /** Used when the total is unknown: the current page came back full. */
  hasMore?: boolean;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Numbered pager: `‹ Prev  1 2 3 4  Next ›`. With a known `totalPages` it shows
 * a window of real page numbers and disables "Next" on the last page. Without
 * one it falls back to a sliding window driven by `hasMore`.
 */
export function Pagination({
  page,
  totalPages,
  hasMore = false,
  loading = false,
  onPageChange,
}: PaginationProps) {
  const knownTotal = typeof totalPages === "number";
  const lastVisible = knownTotal ? totalPages! : page + (hasMore ? 3 : 0);
  const windowStart = Math.max(1, page - 2);
  const pageNumbers: number[] = [];
  for (let n = windowStart; n <= Math.max(lastVisible, page); n += 1) {
    pageNumbers.push(n);
  }
  const canGoNext = knownTotal ? page < totalPages! : hasMore;

  return (
    <nav className={styles.pagination} aria-label="Section pages">
      <button
        type="button"
        className={styles.nav}
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        ‹ Prev
      </button>

      {pageNumbers.map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.page} ${n === page ? styles.active : ""}`}
          aria-current={n === page}
          disabled={loading}
          onClick={() => onPageChange(n)}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        className={styles.nav}
        disabled={!canGoNext || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Next ›
      </button>
    </nav>
  );
}
