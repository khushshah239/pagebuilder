import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import { ArticleByline } from "@/components/ArticleByline";
import type { TrendingArticlesRowProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/TrendingArticlesRow.module.css";

// Strip domain from CDS absolute_url so links stay on the current site
function toPath(url: string | undefined | null): string {
  if (!url) return "#";
  try { return new URL(url).pathname; } catch { return url; }
}

export function TrendingArticlesRow({
  identifier,
  heading,
  trending_cards,
}: TrendingArticlesRowProps) {
  const cards = trending_cards.filter((c) => c.title);
  if (cards.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={cards.length >= 4 ? `${styles.grid} ${styles.gridScroll}` : styles.grid}>
        {cards.map((card, index) => {
          const articleHref = toPath(card.url_slug);
          const categoryHref = toPath(card.category_url);
          const authorHref = toPath(card.author_url);
          const key = `${identifier}-trending-${index}`;
          return (
            <article key={key} className={styles.card}>
              {card.thumbnail && card.url_slug ? (
                <Link href={articleHref} className={styles.imgWrap} tabIndex={-1} prefetch={false}>
                  <img
                    className={styles.thumb}
                    {...cdnImageSrcSet(card.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                    alt={card.title}
                    loading="lazy"
                  />
                </Link>
              ) : card.thumbnail ? (
                <div className={styles.imgWrap}>
                  <img
                    className={styles.thumb}
                    {...cdnImageSrcSet(card.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                    alt={card.title}
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className={styles.text}>
                {card.category_label ? (
                  card.category_url ? (
                    <Link href={categoryHref} className={styles.category} prefetch={false}>
                      {card.category_label}
                    </Link>
                  ) : (
                    <span className={styles.category}>{card.category_label}</span>
                  )
                ) : null}
                {card.url_slug ? (
                  <Link href={articleHref} className={styles.titleLink} prefetch={false}>
                    <h3 className={styles.title}>{card.title}</h3>
                  </Link>
                ) : (
                  <h3 className={styles.title}>{card.title}</h3>
                )}
                <ArticleByline
                  authorName={card.author_name}
                  authorUrl={card.author_url ? authorHref : undefined}
                  publishedAt={card.published_at}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
