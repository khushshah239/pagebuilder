import { extractCustomEntity, fetchHomepage } from "@/api/homepageApi";
import { HomepageRenderer } from "@/components/homepage/HomepageRenderer";
import { HOMEPAGE_LEGACY_URL } from "@/config/cds";

// ISR: cdsFetch already sets { next: { revalidate: REVALIDATE_SECONDS } } on
// the underlying fetch, so the HTTP response is cached natively by Next.js.
// unstable_cache is not used here — the ~3MB homepage payload exceeds its 2MB limit.
export const revalidate = 60;

export default async function HomePage() {
  const response = await fetchHomepage(HOMEPAGE_LEGACY_URL);
  const data = extractCustomEntity(response);

  return (
    <main className="pb-page">
      <div className="pb-stack">
        <HomepageRenderer data={data} />
      </div>
    </main>
  );
}
