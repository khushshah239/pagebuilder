export const dynamic = "force-dynamic";

import Link from "next/link";
import { PbImage } from "@/components/PbImage";
import { fetchSearchResults } from "@/api/searchApi";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return ""; }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const { articles } = query
    ? await fetchSearchResults(query, 1)
    : { articles: [] };

  return (
    <main className="pb-page pb-page-section">
      <div className="pb-stack">

        <div className="pb-search-header">
          <h1 className="pb-search-title">
            {query ? (
              <>Search Results for <span className="pb-search-query">&ldquo;{query}&rdquo;</span></>
            ) : "Search"}
          </h1>
          {articles.length > 0 && (
            <p className="pb-search-count">{articles.length} articles found</p>
          )}
        </div>

        <form className="pb-search-results-form" action="/search" method="get">
          <input
            className="pb-search-results-input"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles…"
            aria-label="Search"
          />
          <button type="submit" className="pb-search-results-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        {!query ? (
          <p className="pb-search-empty">Enter a search term to find articles.</p>
        ) : articles.length === 0 ? (
          <p className="pb-search-empty">No articles found for &ldquo;{query}&rdquo;.</p>
        ) : (
          <div className="pb-search-results">
            {articles.map((article, i) => (
              <article key={article.url_slug ?? i} className="pb-search-card">
                {article.thumbnail && (
                  <Link href={article.url_slug ?? "#"} prefetch={false} className="pb-search-card-img-wrap" tabIndex={-1}>
                    <PbImage
                      src={article.thumbnail}
                      alt=""
                      className="pb-search-card-img"
                      fillParent
                      sizes="(max-width: 600px) 90vw, 360px"
                    />
                  </Link>
                )}
                <div className="pb-search-card-body">
                  {article.category_label && (
                    <Link href={article.category_url ?? "#"} prefetch={false} className="pb-search-card-category">
                      {article.category_label}
                    </Link>
                  )}
                  <Link href={article.url_slug ?? "#"} prefetch={false} className="pb-search-card-title-link">
                    <h2 className="pb-search-card-title">{article.title}</h2>
                  </Link>
                  <div className="pb-search-card-meta">
                    {article.author_name && (
                      <Link href={article.author_url ?? "#"} prefetch={false} className="pb-search-card-author">
                        By {article.author_name}
                      </Link>
                    )}
                    {article.published_at && (
                      <span className="pb-search-card-date">{formatDate(article.published_at)}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
