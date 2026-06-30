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

// 60s ISR cache — pages serve instantly after first load. Set to 0 for always-fresh during dev.
export const REVALIDATE_SECONDS = 60;
