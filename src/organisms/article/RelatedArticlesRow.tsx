import { PbImage } from "@/components/PbImage";
import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import { ScrollRail } from "@/components/ScrollRail";
import type { RelatedArticlesRowProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/RelatedArticlesRow.module.css";

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
      <ScrollRail trackClassName={styles.grid}>
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
                <PbImage
                  className={styles.thumb}
                  src={card.thumbnail}
                  alt={card.title}
                  aspectRatio={16 / 9}
                  sizes="(max-width: 600px) 80vw, 300px"
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
      </ScrollRail>
    </section>
  );
}
