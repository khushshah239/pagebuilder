import Link from "next/link";
import styles from "@/styles/components/Pagination.module.css";

interface LinkPaginationProps {
  page: number;
  totalPages: number;
}

/** URL-based pagination — no client JS needed, works as a server component. */
export function LinkPagination({ page, totalPages }: LinkPaginationProps) {
  if (totalPages <= 1) return null;

  const windowStart = Math.max(1, page - 2);
  const pageNumbers: number[] = [];
  for (let n = windowStart; n <= totalPages; n++) pageNumbers.push(n);

  const href = (p: number) => `?page=${p}`;

  return (
    <nav className={styles.pagination} aria-label="Section pages">
      <Link
        href={href(page - 1)}
        className={`${styles.nav} ${page <= 1 ? styles.disabled : ""}`}
        aria-disabled={page <= 1}
      >
        ‹ Prev
      </Link>

      {pageNumbers.map((n) => (
        <Link
          key={n}
          href={href(n)}
          className={`${styles.page} ${n === page ? styles.active : ""}`}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </Link>
      ))}

      <Link
        href={href(page + 1)}
        className={`${styles.nav} ${page >= totalPages ? styles.disabled : ""}`}
        aria-disabled={page >= totalPages}
      >
        Next ›
      </Link>
    </nav>
  );
}
