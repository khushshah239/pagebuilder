import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import type { TrendingArticlesRowProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/TrendingArticlesRow.module.scss";

/** Trending articles shown below the article content — a row of cards. */
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
          const body = (
            <>
              {card.thumbnail ? (
                <img
                  className={styles.thumb}
                  {...cdnImageSrcSet(card.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                  alt={card.title}
                  loading="lazy"
                />
              ) : null}
              <div className={styles.text}>
                {card.category_label ? (
                  <span className={styles.category}>{card.category_label}</span>
                ) : null}
                <h3 className={styles.title}>{card.title}</h3>
              </div>
            </>
          );
          const key = `${identifier}-trending-${index}`;
          return card.url_slug ? (
            <Link key={key} href={card.url_slug} className={styles.card}>
              {body}
            </Link>
          ) : (
            <article key={key} className={styles.card}>
              {body}
            </article>
          );
        })}
      </div>
    </section>
  );
}
