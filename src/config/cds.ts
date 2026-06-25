// CDS routing constants — change these when onboarding a new publisher.
/** The homepage CustomEntity legacy URL. */
export const HOMEPAGE_LEGACY_URL = "/homepages/homepage";

/** Shared SectionPage template legacy URL. */
export const SECTION_TEMPLATE_LEGACY_URL =
  "/sectionpagetemplates/sectionpagetemplate";

/** Articles per page of a category feed. */
export const SECTION_PAGE_SIZE = 10;

/** Shared AuthorPage template legacy URL. */
export const AUTHOR_TEMPLATE_LEGACY_URL = "/authorpagetemplates/authorpagetemplate";

/** Articles per page of an author feed. */
export const AUTHOR_PAGE_SIZE = 10;

/** Shared TagPage template legacy URL. */
export const TAG_TEMPLATE_LEGACY_URL = "/tagpagetemplates/tagpagetemplate";

/** Fallback articles per page for a tag feed. */
export const TAG_PAGE_SIZE = 10;

/** Shared VideoPage template legacy URL. */
export const VIDEO_TEMPLATE_LEGACY_URL = "/videotemplates/videotemplate";

// 0 = no-store (always fresh); raise in production for ISR.
export const REVALIDATE_SECONDS = 0;
