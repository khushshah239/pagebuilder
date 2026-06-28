import { PbImage } from "@/components/PbImage";
import type { ArticleHeroProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/ArticleHero.module.css";

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
        <PbImage
          className={styles.image}
          src={cover_image}
          alt={caption || ""}
          aspectRatio={16 / 9}
          priority
          sizes="(max-width: 768px) 100vw, min(1200px, 100vw)"
        />
      ) : null}
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
      {excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}
    </figure>
  );
}
