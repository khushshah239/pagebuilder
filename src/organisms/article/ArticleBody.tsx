import type { ArticleBodyProps } from "@/types/article/organism.types";
import { ArticleBodyCollapse } from "./ArticleBodyCollapse";
import styles from "@/styles/organisms/article/ArticleBody.module.scss";

/**
 * Full rich-text article body. Server component — body HTML renders directly to
 * HTML without being serialized into the RSC payload as a client prop.
 * Collapse/expand behaviour is handled by the lightweight ArticleBodyCollapse client wrapper.
 */
export function ArticleBody({ identifier, body }: ArticleBodyProps) {
  if (!body) return null;

  return (
    <div data-organism={identifier}>
      <ArticleBodyCollapse>
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </ArticleBodyCollapse>
    </div>
  );
}
