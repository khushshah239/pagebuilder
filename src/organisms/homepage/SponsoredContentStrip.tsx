import { PbImage } from "@/components/PbImage";
import Link from "next/link";
import type { SponsoredContentStripProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/SponsoredContentStrip.module.css";

/** Clearly labelled sponsored / branded content row, distinct from editorial. */
export function SponsoredContentStrip({
  identifier,
  sponsor_label,
  sponsored_cards,
}: SponsoredContentStripProps) {
  if (sponsored_cards.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      <header className={styles.head}>
        {sponsor_label ? (
          <span className={styles.label}>{sponsor_label}</span>
        ) : null}
      </header>
      <div className={styles.grid}>
        {sponsored_cards.map((card, index) => {
          const body = (
            <>
              {card.thumbnail ? (
                <PbImage
                  className={styles.thumb}
                  src={card.thumbnail}
                  alt={card.title}
                  aspectRatio={16 / 10}
                  sizes="(max-width: 600px) 45vw, 300px"
                />
              ) : null}
              <div className={styles.text}>
                <h3 className={styles.title}>{card.title}</h3>
                {card.brand_name ? (
                  <span className={styles.brand}>{card.brand_name}</span>
                ) : null}
              </div>
            </>
          );
          const key = `${identifier}-card-${index}`;
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
