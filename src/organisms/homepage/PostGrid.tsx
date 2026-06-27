import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { PostGridProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/PostGrid.module.css";

/** Number of supporting story cards shown in the row below the hero. */
const SIDE_SLOTS = 4;

/**
 * Lead story with a large hero image on the left and headline/excerpt/byline on
 * the right, followed by a row of supporting story cards.
 *
 * Uses the stretched-overlay link pattern so category and author links (which
 * are nested interactive elements) sit above the card's article link correctly.
 */
export function PostGrid({ identifier, items }: PostGridProps) {
  const [lead, ...rest] = items;
  if (!lead?.title) return null;

  const sideCards = rest.slice(0, SIDE_SLOTS);

  return (
    <section className={styles.grid} data-organism={identifier}>
      {/* ── Lead (hero) card: image left, text right ─────────────────── */}
      <article className={styles.lead}>
        {lead.url_slug ? (
          <Link href={lead.url_slug} className={styles.leadLink} aria-label={lead.title} />
        ) : null}
        <div className={styles.leadMedia}>
          {lead.image ? (
            <img className={styles.leadImage} {...cdnImageSrcSet(lead.image)} sizes="(max-width: 900px) 100vw, 568px" alt={lead.title} loading="lazy" />
          ) : null}
        </div>
        <div className={styles.leadBody}>
          <CategoryLink
            label={lead.category_label}
            url={lead.category_url}
            className={styles.leadCategory}
          />
          <h2 className={styles.leadTitle}>{lead.title}</h2>
          {lead.excerpt ? <p className={styles.leadExcerpt}>{lead.excerpt}</p> : null}
          <ArticleByline
            authorName={lead.author_name}
            authorUrl={lead.author_url}
            publishedAt={lead.published_at}
          />
        </div>
      </article>

      {/* ── Supporting story row ──────────────────────────────────────── */}
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
                  <img
                    className={styles.cardThumb}
                    {...cdnImageSrcSet(card.thumbnail)} sizes="(max-width: 760px) 50vw, 280px"
                    alt={card.title}
                    loading="lazy"
                  />
                ) : null}
                <div className={styles.cardText}>
                  <CategoryLink
                    label={card.category_label}
                    url={card.category_url}
                    className={styles.cardCategory}
                  />
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
