import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { PostGridProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/PostGrid.module.scss";

/** The right column always reserves this many story rows (filled + empty). */
const SIDE_SLOTS = 4;

/**
 * Lead story with a large hero image (headline + excerpt below it) on the left,
 * and a column of supporting story rows (title + small thumbnail) on the right.
 * The first item is the hero; the remaining items fill the side slots.
 *
 * Uses the stretched-overlay link pattern so category and author links (which
 * are nested interactive elements) sit above the card's article link correctly.
 */
export function PostGrid({ identifier, items }: PostGridProps) {
  const [lead, ...rest] = items;
  if (!lead?.title) return null;

  return (
    <section className={styles.grid} data-organism={identifier}>
      {/* ── Lead (hero) card ─────────────────────────────────────────── */}
      <article className={styles.lead}>
        {lead.url_slug ? (
          <Link href={lead.url_slug} className={styles.leadLink} aria-label={lead.title} />
        ) : null}
        {lead.image ? (
          <img className={styles.leadImage} src={lead.image} alt={lead.title} loading="lazy" />
        ) : null}
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

      {/* ── Right column: side cards ──────────────────────────────────── */}
      <div className={styles.sidecards}>
        {Array.from({ length: SIDE_SLOTS }).map((_, index) => {
          const card = rest[index];
          const key = `${identifier}-side-${index}`;

          if (!card) {
            return <div key={key} className={styles.cardEmpty} aria-hidden="true" />;
          }

          return (
            <article key={key} className={styles.card}>
              {card.url_slug ? (
                <Link href={card.url_slug} className={styles.cardLink} aria-label={card.title} />
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
              {card.thumbnail ? (
                <img
                  className={styles.cardThumb}
                  src={card.thumbnail}
                  alt={card.title}
                  loading="lazy"
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
