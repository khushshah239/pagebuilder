import type { ComponentType } from "react";
import {
  ARTICLE_TEMPLATE_ORDER,
  buildArticleProps,
} from "../../lib/article/buildArticleProps";
import type { ArticleCustomEntity } from "../../types/article/article-cds.types";
import {
  ArticleBody,
  ArticleFooter,
  ArticleHeader,
  ArticleHero,
  ArticleSummary,
  MoreFromAuthorRow,
  RelatedArticlesRow,
  ShareBar,
  TagsRow,
} from "../../organisms/article";

/** Maps a CDS article `schema_slug` to its presentational organism component. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENTS: Record<string, ComponentType<any>> = {
  articlehero: ArticleHero,
  articleheader: ArticleHeader,
  articlesummary: ArticleSummary,
  articlebody: ArticleBody,
  sharebar: ShareBar,
  tagsrow: TagsRow,
  relatedarticlesrow: RelatedArticlesRow,
  morefromauthorrow: MoreFromAuthorRow,
  articlefooter: ArticleFooter,
};

/**
 * Renders the article page in fixed canonical order. For each organism, props
 * come from the live article data (via the template's bindings), falling back
 * to the template's inline content. Organisms absent from this template variant
 * are skipped.
 */
export function ArticleRenderer({ data }: { data: ArticleCustomEntity }) {
  const template = data.template?.[0];
  if (!template) return null;

  return (
    <>
      {ARTICLE_TEMPLATE_ORDER.map((organism, index) => {
        const Component = COMPONENTS[organism.templateKey];
        if (!Component) return null;

        const props = buildArticleProps(template, data, organism);
        if (!props) return null; // organism not in this variant

        return (
          <Component
            key={(props.identifier as string) || index}
            {...props}
          />
        );
      })}
    </>
  );
}
