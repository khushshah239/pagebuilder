import { extractCustomEntity, fetchHomepage } from "@/api/homepageApi";
import { HomepageRenderer } from "@/components/homepage/HomepageRenderer";
import { HOMEPAGE_LEGACY_URL } from "@/config/cds";

export const revalidate = 60;

/**
 * Homepage route. Runtime flow (per the screen-builder schema):
 *   1. Fetch the HomePage CustomEntity by its legacy URL.
 *   2. Unwrap `custom_entity` — it carries the live data slots and the template.
 *   3. HomepageRenderer walks the template layout, applies each organism's
 *      binding field-map to the live data (template defaults as fallback), and
 *      renders the organisms in order.
 */
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
