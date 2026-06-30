import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import { ArticleByline } from "@/components/ArticleByline";
import { CategoryLink } from "@/components/CategoryLink";
import type { OpinionEditorialRowProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/OpinionEditorialRow.module.css";

export function OpinionEditorialRow({
  identifier,
  heading,
  items,
}: OpinionEditorialRowProps) {
  if (items.length === 0) return null;

  const [hero, ...rest] = items;

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
          {hero.excerpt ? <p className={styles.heroExcerpt}>{hero.excerpt}</p> : null}
          <ArticleByline authorName={hero.author_name} authorUrl={hero.author_url} publishedAt={hero.published_at} />
        </div>
      </article>

      {rest.length > 0 && (
        <div className={styles.grid}>
          {rest.map((item, index) => (
            <article key={`${identifier}-item-${index + 1}`} className={styles.card}>
              {item.url_slug ? (
                <Link href={item.url_slug} className={styles.cardLink} aria-label={item.title} />
              ) : null}
              {item.thumbnail ? (
                <div className={styles.media}>
                  <PbImage
                    className={styles.thumb}
                    src={item.thumbnail}
                    alt={item.title}
                    aspectRatio={16 / 9}
                    sizes="(max-width: 600px) 100vw, 340px"
                  />
                  {item.category_label ? (
                    <CategoryLink label={item.category_label} url={item.category_url} className={styles.category} />
                  ) : null}
                </div>
              ) : null}
              <div className={styles.text}>
                <h3 className={styles.title}>{item.title}</h3>
                <ArticleByline authorName={item.author_name} authorUrl={item.author_url} publishedAt={item.published_at} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
