import { InfiniteArticleFeed } from "@/organisms/section/InfiniteArticleFeed";
import type { SectionFeedArticle } from "@/types/section/organism.types";

interface SectionFeedProps {
  articles: SectionFeedArticle[];
}

/** Renders bound feed articles. Server component — no client JS needed. */
export function SectionFeed({ articles }: SectionFeedProps) {
  return (
    <div>
      <InfiniteArticleFeed identifier="section-feed" feed_articles={articles} />
    </div>
  );
}
