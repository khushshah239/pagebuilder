import type { TagHeroBannerProps } from "@/types/tag/organism.types";
import styles from "@/styles/organisms/tag/TagHeroBanner.module.css";

/**
 * Top-of-tag banner: the tag name as a large title with an accent rule beneath
 * it (the tag-page analogue of the section hero). `tag_name` resolves from the
 * live binding, falling back to the organism's own `tag_name` default. Renders
 * nothing without a title.
 */
export function TagHeroBanner({ identifier, tag_name }: TagHeroBannerProps) {
  if (!tag_name) return null;

  return (
    <header className={styles.hero} data-organism={identifier}>
      <h1 className={styles.title}>{tag_name}</h1>
    </header>
  );
}
