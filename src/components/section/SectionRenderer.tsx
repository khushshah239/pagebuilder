import { SectionHeroBanner } from "@/organisms/section/SectionHeroBanner";
import { SectionFeed } from "./SectionFeed";
import {
  buildSectionFeedItems,
  buildSectionHeroProps,
} from "@/lib/section/buildProps";
import type { CategoryInfo, CategoryPostsResponse } from "@/api/sectionApi";

interface SectionRendererProps {
  template: Record<string, unknown>;
  posts: CategoryPostsResponse;
  category?: CategoryInfo | null;
}

/**
 * Render a category page from the shared SectionPage template and the bound
 * articles: the hero (resolved from the template + first article) followed by
 * the feed of exactly the articles the `section-feed` binding defines.
 */
export function SectionRenderer({ template, posts, category }: SectionRendererProps) {
  const heroProps = buildSectionHeroProps(template, posts, category);
  const articles = buildSectionFeedItems(template, posts);

  return (
    <>
      <SectionHeroBanner {...heroProps} />
      <SectionFeed articles={articles} />
    </>
  );
}
