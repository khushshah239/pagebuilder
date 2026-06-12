import { extractArticleEntity, fetchArticle } from "@/api/articleApi";
import {
  getArticlePageIndex,
  makeArticleLinkResolver,
} from "@/api/articlePageIndex";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import { ARTICLE_LEGACY_URL } from "@/config/cds";

// Always fetch fresh so CMS edits to the article page show immediately
// (no stale ISR cache while authoring).
export const dynamic = "force-dynamic";

/**
 * Default article-detail route — renders the canonical sample ArticlePage.
 * Per-article pages are served by `/article/<slug>`; this bare `/article` keeps
 * the canonical page reachable. Related/author cards resolve to their
 * ArticlePage routes so only curated articles link.
 */
export default async function ArticlePage() {
  const [response, index] = await Promise.all([
    fetchArticle(ARTICLE_LEGACY_URL),
    getArticlePageIndex(),
  ]);
  const data = extractArticleEntity(response);
  const resolveLink = makeArticleLinkResolver(index);

  return (
    <main className="pb-page">
      <article className="pb-article">
        <ArticleRenderer data={data} resolveLink={resolveLink} />
      </article>
    </main>
  );
}
