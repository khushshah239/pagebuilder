import { extractArticleEntity, fetchArticle } from "@/api/articleApi";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import { ARTICLE_LEGACY_URL } from "@/config/cds";

// Always fetch fresh so CMS edits to the article page show immediately
// (no stale ISR cache while authoring).
export const dynamic = "force-dynamic";

/**
 * Article-detail route: fetch the article page (live data + embedded template)
 * and assemble organisms — live article data first, template content as fallback.
 */
export default async function ArticlePage() {
  const response = await fetchArticle(ARTICLE_LEGACY_URL);
  const data = extractArticleEntity(response);

  return (
    <main className="pb-page">
      <article className="pb-article">
        <ArticleRenderer data={data} />
      </article>
    </main>
  );
}
