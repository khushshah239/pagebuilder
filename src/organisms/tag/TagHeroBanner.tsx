import type { TagHeroBannerProps } from "@/types/tag/organism.types";
import styles from "@/styles/organisms/tag/TagHeroBanner.module.css";

/**
 * Top-of-tag banner: the tag name as a large title with an accent rule beneath
 * it (the tag-page analogue of the section hero). Falls back to the template
 * heading when no tag name resolves. Renders nothing without a title.
 */
export function TagHeroBanner({ identifier, tag_name, heading }: TagHeroBannerProps) {
  const title = tag_name || heading;
  if (!title) return null;

  return (
    <header className={styles.hero} data-organism={identifier}>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
