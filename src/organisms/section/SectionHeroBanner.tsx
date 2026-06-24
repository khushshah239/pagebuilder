import type { SectionHeroBannerProps } from "@/types/section/organism.types";
import styles from "@/styles/organisms/section/SectionHeroBanner.module.scss";

/**
 * Top-of-section banner: the category name as a large title with an accent rule
 * beneath it. Falls back to the template heading when no category name resolves.
 */
export function SectionHeroBanner({
  identifier,
  section_name,
  heading,
}: SectionHeroBannerProps) {
  const title = section_name || heading;
  if (!title) return null;

  return (
    <header className={styles.hero} data-organism={identifier}>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
