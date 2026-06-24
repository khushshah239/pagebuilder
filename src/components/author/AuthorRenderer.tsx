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
  /** The author's articles (one binding-sized page). */
  posts: AuthorPostsResponse;
}

/**
 * Render an author page from the shared AuthorPage template and the author's
 * live data: the profile header followed by exactly the articles the
 * `author-feed` binding defines. The feed reuses the section card + client-side
 * pager, so it looks like a category page and paginates only when the binding
 * maps more than one page's worth.
 */
export function AuthorRenderer({
  template,
  profile,
  posts,
}: AuthorRendererProps) {
  const headerProps = buildAuthorHeaderProps(template, profile);
  const articles = buildAuthorFeedItems(template, posts);

  return (
    <>
      <AuthorProfileHeader {...headerProps} />
      <SectionFeed articles={articles} />
    </>
  );
}
