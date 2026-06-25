"use client";

import { useState } from "react";
import styles from "@/styles/components/NoTemplateToast.module.css";

/**
 * Shown when an article has no CMS template selected.
 * The page still renders using the default fallback template, but this toast
 * alerts the editor to assign a proper template in the CMS.
 */
export function NoTemplateToast() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className={styles.toast} role="alert">
      <span className={styles.icon}>⚠️</span>
      <p className={styles.message}>
        No template selected for this article. Please add a template in the CMS.
      </p>
      <button
        className={styles.close}
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
