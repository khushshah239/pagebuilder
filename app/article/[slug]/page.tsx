import { notFound } from "next/navigation";
import { extractArticleEntity, fetchArticle } from "@/api/articleApi";
import {
  getArticlePageIndex,
  makeArticleLinkResolver,
} from "@/api/articlePageIndex";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import type { ArticleCustomEntity } from "@/types/article/article-cds.types";

export const dynamic = "force-dynamic";

/** Load an ArticlePage by its slug, or null when the CMS has no such page. */
async function loadArticlePage(
  slug: string
): Promise<ArticleCustomEntity | null> {
  try {
    const data = extractArticleEntity(await fetchArticle(`/articlepages/${slug}`));
    return data.template?.length && data.post?.length ? data : null;
  } catch {
    return null;
  }
}

/**
 * Article-detail route. The slug is the ArticlePage's content-type slug
 * (e.g. `article5`) passed when a card is clicked. We fetch that ArticlePage
 * (`/articlepages/<slug>`), which carries the chosen post plus its template,
 * then render organisms in the template's fixed order. Only ArticlePages that
 * exist in the CMS are routable — anything else 404s.
 */
export default async function ArticleBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await loadArticlePage(slug);
  if (!data) notFound();

  const resolveLink = makeArticleLinkResolver(await getArticlePageIndex());

  return (
    <main className="pb-page">
      <article className="pb-article">
        <ArticleRenderer data={data} resolveLink={resolveLink} />
      </article>
    </main>
  );
}
