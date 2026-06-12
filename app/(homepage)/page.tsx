import {
  getArticlePageIndex,
  makeArticleLinkResolver,
} from "@/api/articlePageIndex";
import { extractCustomEntity, fetchHomepage } from "@/api/homepageApi";
import { HomepageRenderer } from "@/components/homepage/HomepageRenderer";
import { HOMEPAGE_LEGACY_URL } from "@/config/cds";

// Next requires this segment config to be a statically-analyzable literal,
// so it can't reference the imported REVALIDATE_SECONDS (kept at 60 in @/config/cds).
export const revalidate = 60;

/** Homepage route: fetch the CDS payload and assemble organisms from it. */
export default async function HomePage() {
  const [response, index] = await Promise.all([
    fetchHomepage(HOMEPAGE_LEGACY_URL),
    getArticlePageIndex(),
  ]);
  const data = extractCustomEntity(response); // tolerates enveloped or bare shape
  const resolveLink = makeArticleLinkResolver(index);

  return (
    <main className="pb-page">
      <div className="pb-stack">
        <HomepageRenderer data={data} resolveLink={resolveLink} />
      </div>
    </main>
  );
}
