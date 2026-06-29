import { PbImage } from "@/components/PbImage";
import Link from "next/link";
import { ArticleByline } from "@/components/ArticleByline";
import { ScrollRail } from "@/components/ScrollRail";
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
      <ScrollRail trackClassName={cards.length >= 4 ? `${styles.grid} ${styles.gridScroll}` : styles.grid}>
        {cards.map((card, index) => {
          const articleHref = toPath(card.url_slug);
          const categoryHref = toPath(card.category_url);
          const authorHref = toPath(card.author_url);
          const key = `${identifier}-trending-${index}`;
          return (
            <article key={key} className={styles.card}>
              <div className={styles.imgWrap}>
                {card.thumbnail ? (
                  <PbImage
                    className={styles.thumb}
                    src={card.thumbnail}
                    alt=""
                    fillParent
                    sizes="(max-width: 600px) 80vw, 300px"
                  />
                ) : null}
                {card.url_slug ? (
                  <Link href={articleHref} className={styles.imgLink} tabIndex={-1} prefetch={false} aria-hidden="true" />
                ) : null}
                {card.category_label ? (
                  card.category_url ? (
                    <Link href={categoryHref} className={styles.category} prefetch={false}>
                      {card.category_label}
                    </Link>
                  ) : (
                    <span className={styles.category}>{card.category_label}</span>
                  )
                ) : null}
              </div>
              <div className={styles.text}>
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
      </ScrollRail>
    </section>
  );
}
