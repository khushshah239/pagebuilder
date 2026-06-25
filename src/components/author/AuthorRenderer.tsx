import { AuthorProfileHeader } from "@/organisms/author/AuthorProfileHeader";
import { SectionFeed } from "@/components/section/SectionFeed";
import {
  buildAuthorFeedItems,
  buildAuthorHeaderProps,
} from "@/lib/author/buildProps";
import type { AuthorPostsResponse } from "@/api/authorApi";

interface AuthorRendererProps {
  template: Record<string, unknown>;
  profile: Record<string, unknown>;
  posts: AuthorPostsResponse;
  page?: number;
}

export function AuthorRenderer({ template, profile, posts, page }: AuthorRendererProps) {
  const headerProps = buildAuthorHeaderProps(template, profile);
  const articles = buildAuthorFeedItems(template, posts);

  return (
    <>
      <AuthorProfileHeader {...headerProps} />
      <SectionFeed articles={articles} page={page} />
    </>
  );
}
