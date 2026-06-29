import { extractCustomEntity, fetchHomepage } from "@/api/homepageApi";
import { HomepageRenderer } from "@/components/homepage/HomepageRenderer";
import { HOMEPAGE_LEGACY_URL } from "@/config/cds";

// Homepage is a CMS-driven dynamic zone — editors expect layout/order/heading
// changes to show up on the next refresh, not after a 60s ISR window. Setting
// revalidate to 0 disables caching for this route's data fetches entirely
// (Next.js takes the segment config as a ceiling over cdsFetch's own
// next.revalidate), without touching caching on any other route.
export const revalidate = 0;

export default async function HomePage() {
  const response = await fetchHomepage(HOMEPAGE_LEGACY_URL);
  const data = extractCustomEntity(response);

  return (
    <main className="pb-page">
      <HomepageRenderer data={data} />
    </main>
  );
}
