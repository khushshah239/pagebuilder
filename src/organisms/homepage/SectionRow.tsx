import Link from "next/link";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { SectionRowProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/SectionRow.module.scss";

/** Category-specific article row — a horizontal scroll of thumbnail cards. */
export function SectionRow({ identifier, heading, cards }: SectionRowProps) {
  if (cards.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={styles.track}>
        {cards.map((card, index) => {
          const key = `${identifier}-card-${index}`;
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
                  src={card.thumbnail}
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
