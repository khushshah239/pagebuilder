import { PbImage } from "@/components/PbImage";
import Link from "next/link";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import { ScrollRail } from "@/components/ScrollRail";
import type { MoreFromAuthorRowProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/MoreFromAuthorRow.module.css";

/** More stories by the same author — a row of article cards with publish dates. */
export function MoreFromAuthorRow({
  identifier,
  heading,
  author_articles,
}: MoreFromAuthorRowProps) {
  if (author_articles.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <ScrollRail trackClassName={styles.grid}>
        {author_articles.map((card, index) => {
          const key = `${identifier}-author-${index}`;
          return (
            <article key={key} className={styles.card}>
              {card.url_slug ? (
                <Link href={card.url_slug} className={styles.cardLink} aria-label={card.title} prefetch={false} />
              ) : null}
              {card.thumbnail ? (
                <div className={styles.media}>
                  <PbImage
                    className={styles.thumb}
                    src={card.thumbnail}
                    alt=""
                    aspectRatio={16 / 9}
                    sizes="(max-width: 600px) 80vw, 300px"
                  />
                  {card.category_label ? (
                    <CategoryLink
                      label={card.category_label}
                      url={card.category_url}
                      className={styles.category}
                    />
                  ) : null}
                </div>
              ) : null}
              <div className={styles.text}>
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
