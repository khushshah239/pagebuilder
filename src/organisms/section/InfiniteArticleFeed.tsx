import Link from "next/link";
import { AuthorLink } from "@/components/AuthorLink";
import { CategoryLink } from "@/components/CategoryLink";
import { PbImage } from "@/components/PbImage";
import { formatPublishedDateTime } from "@/lib/date";
import type { InfiniteArticleFeedProps } from "@/types/section/organism.types";
import styles from "@/styles/organisms/section/InfiniteArticleFeed.module.css";

// SectionFeed paginates at 10 per page, so this always receives at most 10
// articles and shows pagination controls when there are more.
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
        return (
          <article key={key} className={styles.card}>
            {article.url_slug ? (
              <Link
                href={article.url_slug}
                className={styles.cardLink}
                aria-label={article.title}
                prefetch={false}
              />
            ) : null}
            {article.thumbnail ? (
              <PbImage
                className={styles.thumb}
                src={article.thumbnail}
                alt={article.title}
                aspectRatio={16 / 10}
                sizes="(max-width: 600px) 45vw, 300px"
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
                <div className={styles.meta}>
                  <div className={styles.metaTop}>
                    {article.author_name ? (
                      <AuthorLink
                        name={article.author_name}
                        url={article.author_url}
                        className={styles.author}
                      />
                    ) : null}
                  </div>
                  {time ? <span className={styles.time}>{time}</span> : null}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
