import type { SectionHeroBannerProps } from "@/types/section/organism.types";
import styles from "@/styles/organisms/section/SectionHeroBanner.module.css";

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
