export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  return (
    <main className="pb-page pb-page-section">
      <div className="pb-stack">
        <div className="pb-search-header">
          <h1 className="pb-search-title">
            {query ? (
              <>
                Search results for{" "}
                <span className="pb-search-query">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Search"
            )}
          </h1>
        </div>
        <p className="pb-search-empty">
          {query
            ? `No articles found for "${query}".`
            : "Enter a search term to find articles."}
        </p>
      </div>
    </main>
  );
}
