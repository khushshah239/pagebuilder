import type { TagHeroBannerProps } from "@/types/tag/organism.types";
import styles from "@/styles/organisms/tag/TagHeroBanner.module.css";

export function TagHeroBanner({ identifier, tag_name }: TagHeroBannerProps) {
  if (!tag_name) return null;

  return (
    <header className={styles.hero} data-organism={identifier}>
      <h1 className={styles.title}>{tag_name}</h1>
    </header>
  );
}
