import { cdnImageSrcSet } from "@/lib/media";
import Link from "next/link";
import type { PhotoGalleryTeaserRailProps } from "@/types/homepage/organism.types";
import styles from "@/styles/organisms/homepage/PhotoGalleryTeaserRail.module.css";

/** Horizontal scroll of wide photo-essay teasers. */
export function PhotoGalleryTeaserRail({
  identifier,
  heading,
  gallery_teasers,
}: PhotoGalleryTeaserRailProps) {
  if (gallery_teasers.length === 0) return null;

  return (
    <section className={styles.section} data-organism={identifier}>
      {heading ? (
        <header className={styles.head}>
          <h2 className={styles.heading}>{heading}</h2>
        </header>
      ) : null}
      <div className={styles.track}>
        {gallery_teasers.map((teaser, index) => {
          const body = (
            <>
              {teaser.thumbnail ? (
                <img
                  className={styles.thumb}
                  {...cdnImageSrcSet(teaser.thumbnail)} sizes="(max-width: 400px) 360px, 568px"
                  alt={teaser.title}
                  loading="lazy"
                />
              ) : null}
              <span className={styles.overlay}>
                {teaser.category_label ? (
                  <span className={styles.category}>{teaser.category_label}</span>
                ) : null}
                <span className={styles.title}>{teaser.title}</span>
              </span>
              <span className={styles.badge} aria-hidden="true">
                ◳
              </span>
            </>
          );
          const key = `${identifier}-teaser-${index}`;
          return teaser.url_slug ? (
            <Link key={key} href={teaser.url_slug} className={styles.card}>
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
