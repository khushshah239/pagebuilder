import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { RelatedArticlesRowProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/RelatedArticlesRow.module.scss";

/** Post-article recommended reading — a row of article cards. */
export function RelatedArticlesRow({
  identifier,
  heading,
  related_cards,
}: RelatedArticlesRowProps) {
  if (related_cards.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={styles.grid}>
        {related_cards.map((card, index) => {
          const key = `${identifier}-related-${index}`;
          // Stretched overlay link → article; category link above → section.
          return (
            <article key={key} className={styles.card}>
              {card.url_slug ? (
                <Link
                  href={card.url_slug}
                  className={styles.cardLink}
                  aria-label={card.title}
                />
              ) : null}
              {card.thumbnail ? (
                <img
                  className={styles.thumb}
                  {...cdnImageSrcSet(card.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                  alt={card.title}
                  loading="lazy"
                />
              ) : null}
              <div className={styles.text}>
                <CategoryLink
                  label={card.category_label}
                  url={card.category_url}
                  className={styles.category}
                />
                <h3 className={styles.title}>{card.title}</h3>
                <ArticleByline
                  authorName={card.author_name}
                  authorUrl={card.author_url}
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
