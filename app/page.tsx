import { extractCustomEntity, fetchHomepage } from "@/api/homepageApi";
import { HomepageRenderer } from "@/components/homepage/HomepageRenderer";
import { HOMEPAGE_LEGACY_URL, REVALIDATE_SECONDS } from "@/config/cds";

export const revalidate = REVALIDATE_SECONDS;

/** Homepage route: fetch the CDS payload and assemble organisms from it. */
export default async function HomePage() {
  const response = await fetchHomepage(HOMEPAGE_LEGACY_URL);
  const data = extractCustomEntity(response); // tolerates enveloped or bare shape

  return (
    <main className="pb-page">
      <header className="pb-masthead">{data.name ?? "Homepage"}</header>
      <div className="pb-stack">
        <HomepageRenderer data={data} />
      </div>
    </main>
  );
}
