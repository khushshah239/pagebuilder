import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { fetchArticle, fetchRelatedArticles, fetchMoreFromAuthor, fetchLatestNews } from "@/api/articleApi";
import {
  fetchCategory,
  fetchCategoryPosts,
  fetchSectionTemplate,
  identifyUrl,
} from "@/api/sectionApi";
import {
  fetchAuthorPostsBySlug,
  fetchAuthorProfile,
  fetchAuthorTemplate,
} from "@/api/authorApi";
import { fetchTag, fetchTagPostsBySlug, fetchTagTemplate } from "@/api/tagApi";
import { fetchVideoTemplate } from "@/api/videoApi";
import { ArticleRenderer, ArticleSidebar } from "@/components/article/ArticleRenderer";
import { AuthorRenderer } from "@/components/author/AuthorRenderer";
import { SectionRenderer } from "@/components/section/SectionRenderer";
import { TagRenderer } from "@/components/tag/TagRenderer";
import { WebStoryPlayer } from "@/components/webstory/WebStoryPlayer";
import { VideoRenderer, VideoSidebar } from "@/components/video/VideoRenderer";
import { articleFeedSize } from "@/lib/article/buildProps";
import { sectionFeedSize } from "@/lib/section/buildProps";
import { authorFeedSize } from "@/lib/author/buildProps";
import { tagFeedSize } from "@/lib/tag/buildProps";
import { videoFeedSize, videoBindingRootField } from "@/lib/video/buildProps";
import { buildWebStory } from "@/lib/webstory/buildProps";
import { getActivePublisher } from "@/config/publishers";
import { VIDEO_TEMPLATE_LEGACY_URL } from "@/config/cds";
import type { ArticleData } from "@/types/article/cds.types";

// Page-level ISR — Vercel caches the full rendered page for 60s.
export const revalidate = 60;

const WEB_STORY_TYPE = "Web Story";

/** Returns true if the article template contains a sidebar organism with at least one item. */
function hasSidebarOrganisms(post: ArticleData): boolean {
  const template = post.custom_entity?.template?.[0];
  if (!template) return false;
  return Object.values(template).some((v) => {
    if (!v || typeof v !== "object") return false;
    const node = v as Record<string, unknown>;
    return (
      typeof node.schema_slug === "string" &&
      (node.schema_slug as string).startsWith("sidebar") &&
      Array.isArray(node.dynamic_fields) &&
      (node.dynamic_fields as unknown[]).length > 0
    );
  });
}
/** Content type the CDS assigns to video posts. */
const VIDEO_TYPE = "Video";

// ISR: pages are cached for REVALIDATE_SECONDS then regenerated on next request.
// Set REVALIDATE_SECONDS=0 in dev to always fetch fresh from CDS.

type RouteParams = { params: Promise<{ slug: string[] }> };



/**
 * Reconstruct the CDS legacy URL from the catch-all path segments. Article cards
 * across the site link via `legacy_url → url_slug` (e.g. `/cricket/news/story`),
 * so the full path is the article's CDS address.
 */
function legacyUrlFromSlug(slug: string[]): string {
  return `/${slug.map((segment) => decodeURIComponent(segment)).join("/")}`;
}

/**
 * Fetch the post record by its legacy URL, returning `null` when it can't be
 * resolved.
 */
async function loadPost(slug: string[]): Promise<ArticleData | null> {
  try {
    const response = await fetchArticle(legacyUrlFromSlug(slug));
    const root = response as unknown as { data?: ArticleData };
    return root.data ?? null;
  } catch {
    return null;
  }
}

function isWebStory(post: ArticleData): boolean {
  return (post as Record<string, unknown>).type === WEB_STORY_TYPE;
}
/** True when the post is a video post (rendered by VideoRenderer). */
function isVideoPost(post: ArticleData): boolean {
  return (post as Record<string, unknown>).type === VIDEO_TYPE;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPost(slug);
  const title = typeof data?.title === "string" ? data.title : undefined;
  const description =
    typeof data?.summary === "string" ? data.summary : undefined;
  return title ? { title, description } : {};
}

/**
 * Catch-all route. Resolves the path to one of four page types:
 *   - `category` (via `identify_url`)  → SectionPage (template + paginated feed).
 *   - `member`   (via `identify_url`)  → AuthorPage.
 *   - `tag`      (via `identify_url`)  → TagPage.
 *   - any other post                   → article or video.
 */
// Cache ALL data for each page type including identifyUrl — every wave of CDS
// calls is cached so second request to same URL is near-instant.
const getIdentifiedUrl = unstable_cache(
  async (legacyUrl: string) => identifyUrl(legacyUrl),
  ["identify-url"],
  { revalidate: 60 }
);

const getCategoryPageData = unstable_cache(
  async (slug: string, limit: number) => {
    const [posts, category] = await Promise.all([
      fetchCategoryPosts(slug, 1, limit),
      fetchCategory(slug),
    ]);
    return { posts, category };
  },
  ["category-page"],
  { revalidate: 60 }
);

const getTagPageData = unstable_cache(
  async (tagSlug: string, limit: number) => {
    // Fetch tag profile and posts in parallel — CDS supports tags.slug__eq
    const [tag, posts] = await Promise.all([
      fetchTag(tagSlug),
      fetchTagPostsBySlug(tagSlug, 1, limit),
    ]);
    if (!tag) return null;
    return { tag, posts };
  },
  ["tag-page"],
  { revalidate: 60 }
);

const getAuthorPageData = unstable_cache(
  async (authorSlug: string, limit: number) => {
    // Fetch author profile and posts in parallel — CDS supports contributors.slug__eq
    const [profile, posts] = await Promise.all([
      fetchAuthorProfile(authorSlug),
      fetchAuthorPostsBySlug(authorSlug, 1, limit),
    ]);
    if (!profile) return null;
    return { profile, posts };
  },
  ["author-page-v2"],
  { revalidate: 60 }
);

export default async function CatchAllPage({ params }: RouteParams) {
  const { slug } = await params;

  const legacyUrl = legacyUrlFromSlug(slug);

  // Fire all template fetches immediately — they don't depend on the URL type
  // and are React-cache deduplicated, so calling them here is free if unused.
  fetchSectionTemplate();
  fetchTagTemplate();
  fetchAuthorTemplate();

  // Use cached identifyUrl — on second request to same URL this returns instantly.
  // loadPost runs in parallel for article pages (most common case).
  const [identified, post] = await Promise.all([
    getIdentifiedUrl(legacyUrl),
    loadPost(slug),
  ]);

  if (identified?.type === "category") {
    const template = await fetchSectionTemplate();
    const { posts, category } = await getCategoryPageData(
      identified.url,
      sectionFeedSize(template)
    );

    return (
      <main className="pb-page pb-page-section">
        <div className="pb-stack">
          <SectionRenderer template={template} posts={posts} category={category} />
        </div>
      </main>
    );
  }

  if (identified?.type === "member") {
    const template = await fetchAuthorTemplate();
    const data = await getAuthorPageData(identified.url, authorFeedSize(template));
    if (!data) notFound();

    return (
      <main className="pb-page pb-page-section">
        <div className="pb-stack">
          <AuthorRenderer template={template} profile={data.profile} posts={data.posts} />
        </div>
      </main>
    );
  }

  if (identified?.type === "tag") {
    const template = await fetchTagTemplate();
    const data = await getTagPageData(identified.url, tagFeedSize(template));
    if (!data) notFound();

    return (
      <main className="pb-page pb-page-section">
        <div className="pb-stack">
          <TagRenderer template={template} tag={data.tag} posts={data.posts} />
        </div>
      </main>
    );
  }

  if (!post) notFound();

  if (isWebStory(post)) {
    const { slides, animation } = buildWebStory(post as Record<string, unknown>);
    return (
      <WebStoryPlayer
        slides={slides}
        animation={animation}
        publisherName={getActivePublisher().name}
      />
    );
  }

  if (isVideoPost(post)) {
    const videoTemplate = await fetchVideoTemplate(VIDEO_TEMPLATE_LEGACY_URL);

    const videoPostId = Number(post.id);
    // Video posts may store category as `primary_category` (object) or as the
    // first entry of `categories[]` — try both so the slug is always found.
    const videoPrimaryCategory = post.primary_category as { slug?: string; url_slug?: string } | null | undefined;
    const videoCategoriesList  = post.categories as { slug?: string; url_slug?: string }[] | null | undefined;
    const videoCategorySlug =
      videoPrimaryCategory?.slug ??
      videoPrimaryCategory?.url_slug ??
      videoCategoriesList?.[0]?.slug ??
      videoCategoriesList?.[0]?.url_slug ??
      "";
    const videoContributors = post.contributors as { id?: number }[] | null | undefined;
    const videoAuthorId = Number(videoContributors?.[0]?.id ?? 0);

    // Read count and data-root key for each list organism from the video template
    // binding — zero hardcoding, everything driven by the template at /videotemplates/videotemplate.
    const relatedSize = videoFeedSize(videoTemplate, "relatedarticlesrow", 4);
    const authorSize  = videoFeedSize(videoTemplate, "morefromauthorrow", 4);
    const sidebarSize = videoFeedSize(videoTemplate, "sidebar-latest-news", 6);

    const relatedRootField = videoBindingRootField(videoTemplate, "relatedarticlesrow") || "related_article";
    const authorRootField  = videoBindingRootField(videoTemplate, "morefromauthorrow")  || "more_from_author";
    const sidebarRootField = videoBindingRootField(videoTemplate, "sidebar-latest-news") || "laterst_news_right";

    const existing = (post.custom_entity ?? {}) as Record<string, unknown>;
    const existingRelated  = ((existing[relatedRootField]  as { results?: Record<string, unknown>[] } | null)?.results ?? []);
    const existingAuthor   = ((existing[authorRootField]   as { results?: Record<string, unknown>[] } | null)?.results ?? []);
    // Sidebar Relation field lives on the post root, not inside custom_entity.
    // Check post root first, then fall back to custom_entity.
    const postRoot = post as unknown as Record<string, unknown>;
    const existingSidebar: Record<string, unknown>[] = Array.isArray(postRoot[sidebarRootField])
      ? (postRoot[sidebarRootField] as Record<string, unknown>[])
      : Array.isArray(existing[sidebarRootField])
        ? (existing[sidebarRootField] as Record<string, unknown>[])
        : [];

    const [relatedResult, authorResult, sidebarResult] = await Promise.all([
      existingRelated.length < relatedSize && videoCategorySlug
        ? fetchRelatedArticles(videoCategorySlug, videoPostId, relatedSize)
        : Promise.resolve({ data: existingRelated }),
      existingAuthor.length < authorSize && videoAuthorId > 0
        ? fetchMoreFromAuthor(videoAuthorId, videoPostId, authorSize)
        : Promise.resolve({ data: existingAuthor }),
      existingSidebar.length === 0
        ? fetchLatestNews(videoPostId, sidebarSize)
        : Promise.resolve({ data: existingSidebar }),
    ]);

    const videoCustomEntity: Record<string, unknown> = { ...existing };
    if (relatedResult.data.length > 0)
      videoCustomEntity[relatedRootField] = { results: relatedResult.data };
    if (authorResult.data.length > 0)
      videoCustomEntity[authorRootField] = { results: authorResult.data };
    // Store sidebar as a flat array to match the binding paths (laterst_news_right.0.title).
    if (sidebarResult.data.length > 0)
      videoCustomEntity[sidebarRootField] = sidebarResult.data;

    const enrichedVideoPost = { ...post, custom_entity: videoCustomEntity } as ArticleData;

    return (
      <main className="pb-page">
        <div className="pb-article-layout">
          <article className="pb-article">
            <VideoRenderer data={enrichedVideoPost} template={videoTemplate} />
          </article>
          <aside className="pb-article-aside">
            <VideoSidebar data={enrichedVideoPost} template={videoTemplate} />
          </aside>
        </div>
      </main>
    );
  }

  // Article — needs its `custom_entity` (template variant + collection slots).
  if (!post.custom_entity) notFound();

  const postId = Number(post.id);
  const category = post.primary_category as { slug?: string } | null | undefined;
  const categorySlug = category?.slug ?? "";
  const contributors = post.contributors as { id?: number }[] | null | undefined;
  const authorId = Number(contributors?.[0]?.id ?? 0);

  // Read item counts from the template binding — no hardcoded numbers.
  const articleTemplate = post.custom_entity.template?.[0];
  const relatedSize = articleTemplate ? articleFeedSize(articleTemplate, "relatedarticlesrow", 4) : 4;
  const moreFromAuthorSize = articleTemplate ? articleFeedSize(articleTemplate, "morefromauthorrow", 4) : 4;

  // CDS may already include curated related_article / more_from_author results
  // inside custom_entity. Only fall back to a separate fetch when they're absent.
  const cdsRelated =
    ((post.custom_entity?.related_article as { results?: Record<string, unknown>[] } | null)?.results ?? []);
  const cdsMoreFromAuthor =
    ((post.custom_entity?.more_from_author as { results?: Record<string, unknown>[] } | null)?.results ?? []);

  const [relatedResult, moreFromAuthorResult] = await Promise.all([
    cdsRelated.length < relatedSize && categorySlug
      ? fetchRelatedArticles(categorySlug, postId, relatedSize)
      : Promise.resolve({ data: cdsRelated }),
    cdsMoreFromAuthor.length < moreFromAuthorSize && authorId > 0
      ? fetchMoreFromAuthor(authorId, postId, moreFromAuthorSize)
      : Promise.resolve({ data: cdsMoreFromAuthor }),
  ]);

  // Ensure both lists are always present under custom_entity so the binding
  // layer can resolve related_article.results.* and more_from_author.results.*
  const enrichedPost = {
    ...post,
    custom_entity: {
      ...post.custom_entity,
      related_article: { results: relatedResult.data },
      more_from_author: { results: moreFromAuthorResult.data },
    },
  };

  const hasSidebar = hasSidebarOrganisms(post);
  return (
    <main className="pb-page">
      <div className={hasSidebar ? "pb-article-layout" : "pb-article-layout pb-article-layout--full"}>
        <article className="pb-article">
          <ArticleRenderer data={enrichedPost} />
        </article>
        {hasSidebar && (
          <aside className="pb-article-aside">
            <ArticleSidebar data={enrichedPost} />
          </aside>
        )}
      </div>
    </main>
  );
}
