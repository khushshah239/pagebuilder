import Link from "next/link";
import { AuthorLink } from "@/components/AuthorLink";
import { CategoryLink } from "@/components/CategoryLink";
import { formatPublishedDateTime } from "@/lib/date";
import { widenCdnImage } from "@/lib/media";
import type { InfiniteArticleFeedProps } from "@/types/section/organism.types";
import styles from "@/styles/organisms/section/InfiniteArticleFeed.module.scss";

/**
 * The category/tag/author article grid — renders real articles only (no
 * placeholders). SectionFeed paginates at 10 per page, so this always receives
 * at most 10 articles and shows pagination controls when there are more.
 */
export function InfiniteArticleFeed({
  identifier,
  feed_articles,
}: InfiniteArticleFeedProps) {
  if (feed_articles.length === 0) {
    return (
      <p className={styles.empty}>
        No articles to show — add an article binding in the section template.
      </p>
    );
  }

  return (
    <div className={styles.grid} data-organism={identifier}>
      {feed_articles.map((article, index) => {
        const key = `${identifier}-feed-${index}`;
        const time =
          formatPublishedDateTime(article.published_at) || article.published_at;
        // Stretched overlay link → article; the author in the byline above it
        // links to the author page (its own stacking context, no nested anchor).
        return (
          <article key={key} className={styles.card}>
            {article.url_slug ? (
              <Link
                href={article.url_slug}
                className={styles.cardLink}
                aria-label={article.title}
              />
            ) : null}
            {article.thumbnail ? (
              <img
                className={styles.thumb}
                src={widenCdnImage(article.thumbnail)}
                alt={article.title}
                loading="lazy"
              />
            ) : null}
            <div className={styles.text}>
              <CategoryLink
                label={article.category_label}
                url={article.category_url}
                className={styles.category}
              />
              <h3 className={styles.title}>{article.title}</h3>
              {article.author_name || time ? (
                <span className={styles.meta}>
                  <AuthorLink
                    name={article.author_name}
                    url={article.author_url}
                    className={styles.author}
                  />
                  {article.author_name && time ? " · " : ""}
                  {time}
                </span>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
