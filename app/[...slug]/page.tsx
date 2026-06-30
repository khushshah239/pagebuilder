import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { fetchArticle } from "@/api/articleApi";
import {
  fetchCategory,
  fetchCategoryPosts,
  fetchSectionTemplate,
  identifyUrl,
} from "@/api/sectionApi";
import {
  fetchAuthorPosts,
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
import { articleBindingRootField } from "@/lib/article/buildProps";
import { excludeCurrentFromLists, type ListOrganismConfig } from "@/lib/article/excludeCurrent";
import { resolveBoundItems } from "@/lib/bindings";
import { sectionFeedSize } from "@/lib/section/buildProps";
import { tagFeedSize } from "@/lib/tag/buildProps";
import { authorFeedSize } from "@/lib/author/buildProps";
import { videoBindingRootField } from "@/lib/video/buildProps";
import { buildWebStory } from "@/lib/webstory/buildProps";
import { getActivePublisher } from "@/config/publishers";
import { CDS_PUBLISHER_ID } from "@/config/env";
import { VIDEO_TEMPLATE_LEGACY_URL } from "@/config/cds";
import type { ArticleData } from "@/types/article/cds.types";

// Page-level ISR — Vercel caches the full rendered page for 60s.
export const revalidate = 60;

const WEB_STORY_TYPE = "Web Story";

// Mirrors ArticleRenderer's FORCED_SIDEBAR_SLUGS — organisms always routed to the aside.
const FORCED_SIDEBAR_SLUGS = new Set(["live_blog"]);

function hasSidebarOrganisms(post: ArticleData): boolean {
  const template = post.custom_entity?.template?.[0];
  if (!template) return false;

  const root: Record<string, unknown> = { ...post, ...(post.custom_entity ?? {}) };
  const allBindings = template.data_binding?.dynamic_fields ?? [];

  // Only check known organism keys — skip data_binding and scalar fields.
  return Object.values(template).some((v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    const node = v as { schema_slug?: string; id?: string; dynamic_fields?: unknown[] };
    if (!Array.isArray(node.dynamic_fields)) return false;

    // live_blog's content is authored inline (no field-map binding) — its
    // presence in the template is enough to show the sidebar.
    if (node.schema_slug && FORCED_SIDEBAR_SLUGS.has(node.schema_slug)) {
      return node.dynamic_fields.length > 0;
    }

    if (!node.schema_slug?.startsWith("sidebar")) return false;
    const orgId = node.id ?? node.schema_slug;
    const binding = allBindings.find((b) => b.organism_id === orgId);
    return resolveBoundItems(binding?.field_map?.dynamic_fields ?? [], root).length > 0;
  });
}

const VIDEO_TYPE = "Video";

const ARTICLE_LIST_ORGANISMS: readonly ListOrganismConfig[] = [
  { schemaSlug: "relatedarticlesrow",  defaultField: "related_article",    nested: true },
  { schemaSlug: "morefromauthorrow",   defaultField: "more_from_author",   nested: true },
  { schemaSlug: "sidebar-latest-news", defaultField: "laterst_news_right", nested: false },
  { schemaSlug: "trendingarticlesrow", defaultField: "trending_articles",  nested: false },
  { schemaSlug: "live_blog",           defaultField: "live_blog",          nested: false },
];

const VIDEO_LIST_ORGANISMS: readonly ListOrganismConfig[] = [
  { schemaSlug: "relatedarticlesrow",  defaultField: "related_article",    nested: true },
  { schemaSlug: "morefromauthorrow",   defaultField: "more_from_author",   nested: true },
  { schemaSlug: "sidebar-latest-news", defaultField: "latest_news_right",  nested: false },
];

type RouteParams = { params: Promise<{ slug: string[] }> };

/**
 * Reconstruct the CDS legacy URL from the catch-all path segments. Article cards
 * across the site link via `legacy_url → url_slug` (e.g. `/cricket/news/story`),
 * so the full path is the article's CDS address.
 */
function legacyUrlFromSlug(slug: string[]): string {
  return `/${slug.map((segment) => {
    const decoded = decodeURIComponent(segment);
    // Reject path traversal — if a segment contains "/" after decoding, keep it encoded.
    return decoded.includes("/") ? segment : decoded;
  }).join("/")}`;
}

/**
 * Fetch the post record by its legacy URL, returning `null` when it can't be
 * resolved.
 */
async function loadPost(slug: string[]): Promise<ArticleData | null> {
  try {
    const response = await fetchArticle(legacyUrlFromSlug(slug));
    return response.data ?? null;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status !== 404) {
      console.error("[CDS] loadPost failed for slug:", slug.join("/"), err);
    }
    return null;
  }
}

function isWebStory(post: ArticleData): boolean {
  return post["type"] === WEB_STORY_TYPE;
}
function isVideoPost(post: ArticleData): boolean {
  return post["type"] === VIDEO_TYPE;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadPost(slug);
  const title = typeof data?.title === "string" ? data.title : undefined;
  const description =
    typeof data?.summary === "string" ? data.summary : undefined;
  return title ? { title, description } : {};
}

// Cache each page type's CDS calls (including identifyUrl) so a repeat request
// to the same URL is served from memory.
const getIdentifiedUrl = unstable_cache(
  async (legacyUrl: string) => identifyUrl(legacyUrl),
  [`${CDS_PUBLISHER_ID}-identify-url`],
  { revalidate: 60 }
);

const getCategoryPageData = unstable_cache(
  async (slug: string, limit: number) => {
    try {
      const [posts, category] = await Promise.all([
        fetchCategoryPosts(slug, 1, limit),
        fetchCategory(slug),
      ]);
      return { posts, category };
    } catch {
      return null;
    }
  },
  [`${CDS_PUBLISHER_ID}-category-page`],
  { revalidate: 60 }
);

const getTagPageData = unstable_cache(
  async (tagSlug: string, limit: number) => {
    try {
      const [tag, posts] = await Promise.all([
        fetchTag(tagSlug),
        fetchTagPostsBySlug(tagSlug, 1, limit),
      ]);
      if (!tag) return null;
      return { tag, posts };
    } catch {
      return null;
    }
  },
  [`${CDS_PUBLISHER_ID}-tag-page`],
  { revalidate: 60 }
);

const getAuthorPageData = unstable_cache(
  async (authorSlug: string, limit: number) => {
    try {
      const profile = await fetchAuthorProfile(authorSlug);
      const authorId = Number(profile?.id);
      if (!profile || !Number.isFinite(authorId) || authorId <= 0) return null;
      const posts = await fetchAuthorPosts(authorId, 1, limit);
      return { profile, posts };
    } catch {
      return null;
    }
  },
  [`${CDS_PUBLISHER_ID}-author-page`],
  { revalidate: 60 }
);

export default async function CatchAllPage({ params }: RouteParams) {
  const { slug } = await params;

  const legacyUrl = legacyUrlFromSlug(slug);

  // Pre-warm shared template caches (unstable_cache hits are instant in memory).
  void Promise.all([fetchSectionTemplate(), fetchTagTemplate(), fetchAuthorTemplate()]);

  // loadPost is a React cache hit from generateMetadata — resolves instantly.
  // Checking it first means article/video/webstory pages skip the identifyUrl
  // network round-trip entirely.
  const post = await loadPost(slug);

  if (post) {
    if (isWebStory(post)) {
      return renderWebStoryPage(post);
    }
    if (isVideoPost(post)) {
      return renderVideoPage(post);
    }
    return renderArticlePage(post);
  }

  // Not a post — ask CDS what kind of section this URL points to.
  const identified = await getIdentifiedUrl(legacyUrl);

  if (identified?.type === "tag") {
    return renderTagPage(identified.url);
  }
  if (identified?.type === "member") {
    return renderAuthorPage(identified.url);
  }
  if (identified?.type === "category") {
    return renderCategoryPage(identified.url);
  }

  notFound();
}

async function renderArticlePage(post: ArticleData) {
  if (!post.custom_entity) notFound();

  const articleTemplate = post.custom_entity.template?.[0];
  const updatedFields = excludeCurrentFromLists(
    post,
    ARTICLE_LIST_ORGANISMS,
    (schemaSlug) => (articleTemplate ? articleBindingRootField(articleTemplate, schemaSlug) : "")
  );
  const enrichedPost: ArticleData = {
    ...post,
    custom_entity: { ...post.custom_entity, ...updatedFields },
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

async function renderVideoPage(post: ArticleData) {
  const videoTemplate = await fetchVideoTemplate(VIDEO_TEMPLATE_LEGACY_URL);

  const updatedFields = excludeCurrentFromLists(
    post,
    VIDEO_LIST_ORGANISMS,
    (schemaSlug) => videoBindingRootField(videoTemplate, schemaSlug)
  );
  const enrichedVideoPost: ArticleData = {
    ...post,
    custom_entity: { ...(post.custom_entity ?? {}), ...updatedFields },
  };

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

function renderWebStoryPage(post: ArticleData) {
  const { slides, animation } = buildWebStory(post as ArticleData & Record<string, unknown>);
  return (
    <WebStoryPlayer
      slides={slides}
      animation={animation}
      publisherName={getActivePublisher().name}
    />
  );
}

async function renderTagPage(tagSlug: string) {
  const template = await fetchTagTemplate();
  const data = await getTagPageData(tagSlug, tagFeedSize(template));
  if (!data) notFound();

  return (
    <main className="pb-page pb-page-section">
      <div className="pb-stack">
        <TagRenderer template={template} tag={data.tag} posts={data.posts} />
      </div>
    </main>
  );
}

async function renderAuthorPage(authorSlug: string) {
  const template = await fetchAuthorTemplate();
  const data = await getAuthorPageData(authorSlug, authorFeedSize(template));
  if (!data) notFound();

  return (
    <main className="pb-page pb-page-section">
      <div className="pb-stack">
        <AuthorRenderer template={template} profile={data.profile} posts={data.posts} />
      </div>
    </main>
  );
}

async function renderCategoryPage(categorySlug: string) {
  const template = await fetchSectionTemplate();
  const categoryData = await getCategoryPageData(categorySlug, sectionFeedSize(template));
  if (!categoryData) notFound();
  const { posts, category } = categoryData;

  return (
    <main className="pb-page pb-page-section">
      <div className="pb-stack">
        <SectionRenderer template={template} posts={posts} category={category} />
      </div>
    </main>
  );
}
