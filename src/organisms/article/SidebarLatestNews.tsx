import { PbImage } from "@/components/PbImage";
import Link from "next/link";
import { CategoryLink } from "@/components/CategoryLink";
import { ArticleByline } from "@/components/ArticleByline";
import type { SidebarLatestNewsProps } from "@/types/article/organism.types";
import styles from "@/styles/organisms/article/SidebarLatestNews.module.css";

export function SidebarLatestNews({
  identifier,
  heading,
  items,
}: SidebarLatestNewsProps) {
  const filled = items.filter((item) => item.title).slice(0, 6);
  if (filled.length === 0) return null;

  return (
    <section className={styles.panel} data-organism={identifier}>
      {heading ? <h2 className={styles.heading}>{heading}</h2> : null}
      <ol className={styles.list}>
        {filled.map((item, index) => (
          <li key={`${identifier}-latest-${index}`} className={styles.item}>
            {item.url_slug ? (
              <Link href={item.url_slug} className={styles.link} aria-label={item.title} prefetch={false} />
            ) : null}

            <span className={styles.rank}>{index + 1}</span>

            <div className={styles.text}>
              <h3 className={styles.title}>{item.title}</h3>
              <ArticleByline
                authorName={item.author_name}
                authorUrl={item.author_url}
                publishedAt={item.published_at}
              />
            </div>

            <div className={styles.thumbWrap}>
              {item.thumbnail ? (
                <PbImage
                  className={styles.thumb}
                  src={item.thumbnail}
                  alt={item.title}
                  fillParent
                  sizes="100px"
                />
              ) : (
                <div className={styles.thumbEmpty} />
              )}
              {item.category_label ? (
                <CategoryLink
                  label={item.category_label}
                  url={item.category_url}
                  className={styles.category}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
