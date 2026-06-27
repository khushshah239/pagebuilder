import { TagHeroBanner } from "@/organisms/tag/TagHeroBanner";
import { SectionFeed } from "@/components/section/SectionFeed";
import { buildTagHeroProps, buildTagFeedItems } from "@/lib/tag/buildProps";
import type { TagPostsResponse } from "@/api/tagApi";

interface TagRendererProps {
  template: Record<string, unknown>;
  tag: Record<string, unknown>;
  posts: TagPostsResponse;
}

/** Renders a tag page: hero then article feed from the tag template. */
export function TagRenderer({ template, tag, posts }: TagRendererProps) {
  const heroProps = buildTagHeroProps(template, tag, posts);
  const articles = buildTagFeedItems(template, posts);

  return (
    <>
      <TagHeroBanner {...heroProps} />
      <SectionFeed articles={articles} />
    </>
  );
}
