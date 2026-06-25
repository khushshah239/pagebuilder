import styles from "./[...slug]/loading.module.css";

export default function Loading() {
  return (
    <main className="pb-page">
      <div className={styles.skeleton}>
        <div className={styles.hero} />
        <div className={styles.content}>
          <div className={styles.line} />
          <div className={styles.line} style={{ width: "70%" }} />
          <div className={styles.block} />
          <div className={styles.line} style={{ width: "85%" }} />
        </div>
      </div>
    </main>
  );
}
