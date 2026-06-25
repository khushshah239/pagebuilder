import { cdsFetch } from "./cdsClient";
import type { SectionFeedArticle } from "@/types/section/organism.types";

export const SEARCH_PAGE_SIZE = 10;

interface RawPost {
  title?: string;
  legacy_url?: string;
  published_at?: string;
  banner_url?: string;
  primary_category?: { name?: string; absolute_url?: string };
  contributors?: { name?: string; absolute_url?: string }[];
}

interface SearchResponse {
  data?: RawPost[];
}

function toPath(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try { return new URL(url).pathname; } catch { return url; }
}

function mapPost(post: RawPost): SectionFeedArticle {
  const author = Array.isArray(post.contributors) ? post.contributors[0] : undefined;
  return {
    title: post.title ?? "",
    thumbnail: post.banner_url,
    category_label: post.primary_category?.name,
    category_url: toPath(post.primary_category?.absolute_url),
    author_name: author?.name,
    author_url: toPath(author?.absolute_url),
    published_at: post.published_at,
    url_slug: post.legacy_url,
  };
}

export interface SearchResult {
  articles: SectionFeedArticle[];
  hasMore: boolean;
}

export async function fetchSearchResults(
  query: string,
  page: number
): Promise<SearchResult> {
  if (!query.trim()) return { articles: [], hasMore: false };
  try {
    const path =
      `/posts/?type__eq=Article&title__contains=${encodeURIComponent(query.trim())}` +
      `&page=${page}&limit=${SEARCH_PAGE_SIZE}`;
    const res = await cdsFetch<SearchResponse>(path);
    const articles = Array.isArray(res.data) ? res.data.map(mapPost) : [];
    return {
      articles,
      hasMore: articles.length === SEARCH_PAGE_SIZE,
    };
  } catch {
    return { articles: [], hasMore: false };
  }
}
