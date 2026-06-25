import { InfiniteArticleFeed } from "@/organisms/section/InfiniteArticleFeed";
import { LinkPagination } from "./LinkPagination";
import type { SectionFeedArticle } from "@/types/section/organism.types";

const CARDS_PER_PAGE = 10;

interface SectionFeedProps {
  articles: SectionFeedArticle[];
  page?: number;
}

/** Server component — articles render to HTML directly, no RSC payload bloat. */
export function SectionFeed({ articles, page = 1 }: SectionFeedProps) {
  const totalPages = Math.max(1, Math.ceil(articles.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * CARDS_PER_PAGE;
  const visible = articles.slice(start, start + CARDS_PER_PAGE);

  return (
    <div>
      <InfiniteArticleFeed identifier="section-feed" feed_articles={visible} />
      <LinkPagination page={currentPage} totalPages={totalPages} />
    </div>
  );
}
