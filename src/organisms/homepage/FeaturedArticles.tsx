import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { FeaturedArticlesProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/FeaturedArticles.module.css";

export function FeaturedArticles({
  identifier,
  heading,
  cards,
}: FeaturedArticlesProps) {
  if (cards.length === 0) return null;

  const [hero, ...rest] = cards;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}

      <article className={styles.hero}>
        {hero.url_slug ? (
          <Link href={hero.url_slug} className={styles.cardLink} aria-label={hero.title} />
        ) : null}
        {hero.thumbnail ? (
          <div className={styles.heroMedia}>
            <PbImage
              className={styles.heroThumb}
              src={hero.thumbnail}
              alt={hero.title}
              aspectRatio={16 / 7}
              sizes="(max-width: 768px) 100vw, 700px"
            />
            {hero.category_label ? (
              <CategoryLink label={hero.category_label} url={hero.category_url} className={styles.category} />
            ) : null}
          </div>
        ) : null}
        <div className={styles.heroText}>
          <h3 className={styles.heroTitle}>{hero.title}</h3>
          <ArticleByline authorName={hero.author_name} authorUrl={hero.author_url} publishedAt={hero.published_at} />
        </div>
      </article>

      {rest.length > 0 && (
        <div className={styles.grid}>
          {rest.map((card, index) => (
            <article key={`${identifier}-card-${index + 1}`} className={styles.card}>
              {card.url_slug ? (
                <Link href={card.url_slug} className={styles.cardLink} aria-label={card.title} />
              ) : null}
              {card.thumbnail ? (
                <div className={styles.media}>
                  <PbImage
                    className={styles.thumb}
                    src={card.thumbnail}
                    alt={card.title}
                    aspectRatio={16 / 9}
                    sizes="(max-width: 600px) 100vw, 340px"
                  />
                  {card.category_label ? (
                    <CategoryLink label={card.category_label} url={card.category_url} className={styles.category} />
                  ) : null}
                </div>
              ) : null}
              <div className={styles.text}>
                <h3 className={styles.title}>{card.title}</h3>
                <ArticleByline authorName={card.author_name} authorUrl={card.author_url} publishedAt={card.published_at} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
