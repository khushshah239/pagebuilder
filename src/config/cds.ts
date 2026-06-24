/**
 * CDS endpoint configuration.
 *
 * Onboarding a new publisher changes only the values here and in the publisher
 * registry — never the components or resolver. Connection values come from
 * `env.ts`; this file adds the CDS-specific routing constants.
 */
/** The homepage CustomEntity is addressed by this legacy URL. */
export const HOMEPAGE_LEGACY_URL = "/homepages/homepage";

/** The shared SectionPage (category) template, fetched once and reused. */
export const SECTION_TEMPLATE_LEGACY_URL =
  "/sectionpagetemplates/sectionpagetemplate";

/** Articles per page of a category feed (a 5-column grid → 2 rows per page). */
export const SECTION_PAGE_SIZE = 10;

/** The shared AuthorPage template, fetched once and reused. */
export const AUTHOR_TEMPLATE_LEGACY_URL = "/authorpagetemplates/authorpagetemplate";

/** Articles per page of an author's article feed (a 5-column grid → 2 rows). */
export const AUTHOR_PAGE_SIZE = 10;

/** The shared TagPage template, fetched once and reused. */
export const TAG_TEMPLATE_LEGACY_URL = "/tagpagetemplates/tagpagetemplate";

/** Fallback article count for tag feed when no binding is configured. */
export const TAG_PAGE_SIZE = 10;

/** The shared VideoPage template legacy URL. */
export const VIDEO_TEMPLATE_LEGACY_URL = "/videotemplates/videotemplate";

/**
 * Cache window (seconds) for CDS-backed routes.
 *
 * `0` = always fetch fresh, so editor changes (e.g. reordering the Dynamic Zone)
 * appear on the next page load. Raise this in production (e.g. 60) to serve
 * cached pages via ISR and reduce CDS traffic.
 */
export const REVALIDATE_SECONDS = 0;
