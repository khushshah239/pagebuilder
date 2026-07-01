import { PbImage } from "@/components/PbImage";
import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { PostGridProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/PostGrid.module.css";

/** Number of supporting story cards shown in the row below the hero. */
const SIDE_SLOTS = 4;

export function PostGrid({ identifier, items }: PostGridProps) {
  const [lead, ...rest] = items;
  if (!lead?.title) return null;

  const sideCards = rest.slice(0, SIDE_SLOTS);

  return (
    <section className={styles.grid} data-organism={identifier}>
      <article className={styles.lead}>
        {lead.url_slug ? (
          <Link href={lead.url_slug} className={styles.leadLink} aria-label={lead.title} />
        ) : null}
        <div className={styles.leadMedia}>
          {lead.image ? (
            <PbImage
              className={styles.leadImage}
              src={lead.image}
              alt={lead.title}
              fillParent
              priority
              sizes="(max-width: 900px) 100vw, 600px"
            />
          ) : null}
          {lead.category_label ? (
            <CategoryLink
              label={lead.category_label}
              url={lead.category_url}
              className={styles.leadCategory}
            />
          ) : null}
        </div>
        <div className={styles.leadBody}>
          <h2 className={styles.leadTitle}>{lead.title}</h2>
          {lead.excerpt ? <p className={styles.leadExcerpt}>{lead.excerpt}</p> : null}
          <ArticleByline
            authorName={lead.author_name}
            authorUrl={lead.author_url}
            publishedAt={lead.published_at}
          />
          <span className={styles.leadReadMore} aria-hidden="true">
            Read Full Story
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </article>

      {sideCards.length > 0 ? (
        <div className={styles.feed}>
          {sideCards.map((card, index) => {
            const key = `${identifier}-side-${index}`;
            return (
              <article key={key} className={styles.card}>
                {card.url_slug ? (
                  <Link href={card.url_slug} className={styles.cardLink} aria-label={card.title} />
                ) : null}
                {card.thumbnail ? (
                  <div className={styles.cardMedia}>
                    <PbImage
                      className={styles.cardThumb}
                      src={card.thumbnail}
                      alt={card.title}
                      aspectRatio={16 / 9}
                      sizes="(max-width: 760px) 50vw, 280px"
                    />
                    {card.category_label ? (
                      <CategoryLink
                        label={card.category_label}
                        url={card.category_url}
                        className={styles.cardCategory}
                      />
                    ) : null}
                  </div>
                ) : null}
                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
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
      ) : null}
    </section>
  );
}
