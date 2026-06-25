import { widenCdnImage } from "@/lib/media";
import type { ArticleHeroProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ArticleHero.module.scss";

/** Full-width hero image with an optional excerpt/standfirst below it. */
export function ArticleHero({
  identifier,
  cover_image,
  excerpt,
  caption,
}: ArticleHeroProps) {
  if (!cover_image && !excerpt) return null;

  return (
    <figure className={styles.hero} data-organism={identifier}>
      {cover_image ? (
        <img
          className={styles.image}
          src={widenCdnImage(cover_image, "1200x675")}
          srcSet={`${widenCdnImage(cover_image, "768x432")} 768w, ${widenCdnImage(cover_image, "1200x675")} 1200w`}
          sizes="(max-width: 768px) 768px, 1200px"
          alt={caption || ""}
          loading="eager"
        />
      ) : null}
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
      {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
    </figure>
  );
}
