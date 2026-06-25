import styles from "./loading.module.scss";

export default function Loading() {
  return (
    <main className="pb-page">
      <div className={styles.skeleton}>
        <div className={styles.hero} />
        <div className={styles.content}>
          <div className={styles.line} />
          <div className={styles.line} style={{ width: "80%" }} />
          <div className={styles.line} style={{ width: "60%" }} />
          <div className={styles.block} />
          <div className={styles.line} />
          <div className={styles.line} style={{ width: "75%" }} />
        </div>
      </div>
    </main>
  );
}
