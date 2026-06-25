import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { SidebarLatestNewsProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/SidebarLatestNews.module.scss";

/**
 * Right-column "Latest News" panel on the article page. A compact vertical list
 * of recent stories (thumbnail + headline + meta), each linking to its article.
 * Items resolve from the `laterst_news_right` relation via the binding, falling
 * back to the template's inline defaults when empty.
 */
export function SidebarLatestNews({
  identifier,
  heading,
  items,
}: SidebarLatestNewsProps) {
  const filled = items.filter((item) => item.title).slice(0, 6);
  if (filled.length === 0) return null;
  const slots: (typeof filled[number] | null)[] = [
    ...filled,
    ...Array(Math.max(0, 6 - filled.length)).fill(null),
  ];

  return (
    <section className={styles.panel} data-organism={identifier}>
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      <ol className={styles.list}>
        {slots.map((item, index) => {
          if (!item) {
            return (
              <li
                key={`${identifier}-empty-${index}`}
                className={`${styles.item} ${styles.itemEmpty}`}
                aria-hidden="true"
              />
            );
          }
          const key = `${identifier}-latest-${index}`;
          // Stretched overlay link → article; category link above → section.
          return (
            <li key={key} className={styles.item}>
              {item.url_slug ? (
                <Link
                  href={item.url_slug}
                  className={styles.link}
                  aria-label={item.title}
                />
              ) : null}
              {item.thumbnail ? (
                <img
                  className={styles.thumb}
                  {...cdnImageSrcSet(item.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                  alt={item.title}
                  loading="lazy"
                />
              ) : <div className={styles.thumbEmpty} />}
              <div className={styles.text}>
                <CategoryLink
                  label={item.category_label}
                  url={item.category_url}
                  className={styles.category}
                />
                <h3 className={styles.title}>{item.title}</h3>
                <ArticleByline
                  authorName={item.author_name}
                  authorUrl={item.author_url}
                  publishedAt={item.published_at}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
