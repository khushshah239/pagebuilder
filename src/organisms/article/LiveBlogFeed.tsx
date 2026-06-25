import Link from "next/link";
import type { LiveBlogFeedProps, LiveUpdate } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/LiveBlogFeed.module.scss";

/**
 * Strip the origin from an absolute CDS URL so it routes through the local
 * Next.js app instead of the external publisher domain.
 * e.g. "https://crictoday-beta.thepublive.com/cricket/" → "/cricket/"
 * Already-relative paths (starting with "/") pass through unchanged.
 */
function toPath(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return url; // already a relative path
  }
}

function parsedBody(update: LiveUpdate): { title: string; html: string } {
  const raw = update.body ?? "";
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      title: (parsed.title as string) || (update.title ?? ""),
      html: (parsed.content as string) || (parsed.body as string) || raw,
    };
  } catch {
    return { title: update.title ?? "", html: raw };
  }
}

/** Real-time chronological update stream inside a live story. */
export function LiveBlogFeed({
  identifier,
  blog_title,
  live_updates,
}: LiveBlogFeedProps) {
  if (live_updates.length === 0) return null;

  const isPostRefMode = live_updates.some(
    (u) => (u.url || u.url_slug || u.thumbnail || u.author_name) && !u.body
  );

  if (isPostRefMode) {
    return (
      <section className={styles.feed} data-organism={identifier}>
        <header className={styles.head}>
          <span className={styles.liveBadge}>LIVE</span>
          {blog_title ? <h2 className={styles.title}>{blog_title}</h2> : null}
        </header>
        <ul className={styles.cardList}>
          {live_updates.map((update, index) => {
            const articleHref = toPath(update.url_slug ?? update.url);
            const categoryHref = toPath(update.category_url);
            const authorHref = toPath(update.author_url);
            const authorLabel = update.author_name ?? update.author;
            return (
              <li key={`${identifier}-ref-${index}`} className={styles.card}>
                {(update.thumbnail || update.image) ? (
                  articleHref ? (
                    <Link href={articleHref}>
                      <img className={styles.cardThumb} src={update.thumbnail ?? update.image} alt="" loading="lazy" />
                    </Link>
                  ) : (
                    <img className={styles.cardThumb} src={update.thumbnail ?? update.image} alt="" loading="lazy" />
                  )
                ) : null}
                <div className={styles.cardBody}>
                  {update.category_label ? (
                    categoryHref ? (
                      <Link href={categoryHref} className={styles.cardCategory}>{update.category_label}</Link>
                    ) : (
                      <span className={styles.cardCategory}>{update.category_label}</span>
                    )
                  ) : null}
                  {update.title ? (
                    articleHref ? (
                      <Link href={articleHref} className={styles.cardTitle}>{update.title}</Link>
                    ) : (
                      <span className={styles.cardTitle}>{update.title}</span>
                    )
                  ) : null}
                  {authorLabel ? (
                    <div className={styles.cardMeta}>
                      {authorHref ? (
                        <Link href={authorHref} className={styles.cardAuthor}>{authorLabel}</Link>
                      ) : (
                        <span className={styles.cardAuthor}>{authorLabel}</span>
                      )}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className={styles.feed} data-organism={identifier}>
      <header className={styles.head}>
        <span className={styles.liveBadge}>LIVE</span>
        {blog_title ? <h2 className={styles.title}>{blog_title}</h2> : null}
      </header>
      <ol className={styles.timeline}>
        {live_updates.map((update, index) => {
          const time = update.timestamp || update.published_at;
          const { title, html } = parsedBody(update);
          const articleHref = toPath(update.url_slug ?? update.url);
          return (
            <li key={`${identifier}-update-${index}`} className={styles.entry}>
              {time || update.author ? (
                <div className={styles.meta}>
                  {time ? <time className={styles.time}>{time}</time> : null}
                  {update.author ? (
                    <span className={styles.author}>{update.author}</span>
                  ) : null}
                </div>
              ) : null}
              {title ? (
                articleHref ? (
                  <h3 className={styles.updateTitle}>
                    <Link href={articleHref}>{title}</Link>
                  </h3>
                ) : (
                  <h3 className={styles.updateTitle}>{title}</h3>
                )
              ) : null}
              {html ? (
                <div
                  className={styles.body}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : null}
              {update.image ? (
                <img className={styles.image} src={update.image} alt="" loading="lazy" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
