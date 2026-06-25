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

/** Renders a category page: hero then article feed from the section template. */
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
