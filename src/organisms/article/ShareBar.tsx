import type { ShareBarProps } from "../../types/article/article.types";
import styles from "../../styles/organisms/article/ShareBar.module.css";

/** Row of social share buttons for the article. */
export function ShareBar({ identifier, share_buttons }: ShareBarProps) {
  if (share_buttons.length === 0) return null;

  return (
    <div className={styles.bar} data-organism={identifier} aria-label="Share">
      <span className={styles.label}>Share</span>
      <ul className={styles.buttons}>
        {share_buttons.map((button, index) => (
          <li key={`${identifier}-share-${index}`}>
            <button
              type="button"
              className={styles.button}
              aria-label={`Share on ${button.platform_name}`}
            >
              {button.icon ? (
                <img className={styles.icon} src={button.icon} alt="" />
              ) : (
                button.platform_name
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShareBar;
