import type { SectionHeroBannerProps } from "@/types/section/organism.types";
import styles from "@/styles/organisms/section/SectionHeroBanner.module.css";

/**
 * Top-of-section banner: the category name as a large title with an accent rule
 * beneath it. `section_name` resolves from the live binding, falling back to the
 * organism's own `section_name` default. Renders nothing without a title.
 */
export function SectionHeroBanner({
  identifier,
  section_name,
}: SectionHeroBannerProps) {
  if (!section_name) return null;

  return (
    <header className={styles.hero} data-organism={identifier}>
      <h1 className={styles.title}>{section_name}</h1>
    </header>
  );
}
