"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/section/Pagination";

interface SearchPaginationProps {
  page: number;
  hasMore: boolean;
}

export function SearchPagination({ page, hasMore }: SearchPaginationProps) {
  const router = useRouter();
  const params = useSearchParams();

  function handlePageChange(newPage: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(newPage));
    router.push(`/search?${next.toString()}`);
  }

  return (
    <Pagination
      page={page}
      hasMore={hasMore}
      onPageChange={handlePageChange}
    />
  );
}
