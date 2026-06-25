import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { OpinionEditorialRowProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/OpinionEditorialRow.module.scss";

/** Horizontal row of opinion / editorial pieces with author attribution. */
export function OpinionEditorialRow({
  identifier,
  heading,
  items,
}: OpinionEditorialRowProps) {
  if (items.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={styles.grid}>
        {items.map((item, index) => {
          const key = `${identifier}-item-${index}`;
          // Stretched overlay link → article; category link above → section.
          return (
            <article key={key} className={styles.card}>
              {item.url_slug ? (
                <Link
                  href={item.url_slug}
                  className={styles.cardLink}
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
              ) : null}
              <div className={styles.text}>
                <CategoryLink
                  label={item.category_label}
                  url={item.category_url}
                  className={styles.category}
                />
                <h3 className={styles.title}>{item.title}</h3>
                {item.excerpt ? (
                  <p className={styles.excerpt}>{item.excerpt}</p>
                ) : null}
                <ArticleByline
                  authorName={item.author_name}
                  authorUrl={item.author_url}
                  publishedAt={item.published_at}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
