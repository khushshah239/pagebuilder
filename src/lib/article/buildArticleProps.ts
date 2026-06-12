import { resolveBoundItems } from "../homepage/bindings";
import type {
  ArticleCustomEntity,
  CdsArticleTemplate,
} from "../../types/article/article-cds.types";

// The article page has NO dynamic layout zone — organisms render in this FIXED
// canonical order. Data priority: the ARTICLE PAGE first (the chosen article in
// `post[0]`, plus the live related/author slots), template content as fallback.

/** Reduce a CDS media object to its URL string. */
function flattenMedia(value: unknown): string {
  if (value && typeof value === "object") {
    const media = value as Record<string, unknown>;
    return (media.absolute_path as string) ?? (media.path as string) ?? "";
  }
  return typeof value === "string" ? value : "";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Format an ISO datetime to a readable date; pass other strings through. */
function formatDate(value: unknown): string {
  const text = asText(value);
  if (!text) return "";
  const date = new Date(text);
  return Number.isNaN(date.getTime())
    ? text
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

/** The repeated items of a nested slot (key_points, share_buttons, …). */
function innerItems(node: unknown): Record<string, unknown>[] {
  const slot = node as { dynamic_fields?: Record<string, unknown>[] } | undefined;
  return slot?.dynamic_fields ?? [];
}

/** The template's inline content for one organism. */
function templateFields(
  template: CdsArticleTemplate,
  key: string
): Record<string, unknown> {
  const organism = template[key] as
    | { dynamic_fields?: Record<string, unknown>[] }
    | undefined;
  return organism?.dynamic_fields?.[0] ?? {};
}

/** The chosen article (`post[0]`) — the article page's own content. */
function articlePost(article: ArticleCustomEntity): Record<string, unknown> {
  const posts = article.post as Record<string, unknown>[] | undefined;
  return posts?.[0] ?? {};
}

/** Strip a trailing slash so URLs compare reliably. */
function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Remove the currently-viewed article from a related/author list (so the page
 * never lists itself) and dedupe repeated articles, keyed by `url_slug`.
 */
function dedupeExcludingCurrent(
  items: Record<string, unknown>[],
  currentUrl: string
): Record<string, unknown>[] {
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  for (const item of items) {
    const slug = stripSlash(asText(item.url_slug));
    if (slug) {
      if (slug === currentUrl || seen.has(slug)) continue;
      seen.add(slug);
    }
    out.push(item);
  }
  return out;
}

/**
 * Resolve an organism's bindings against the live article data (used for the
 * related/author slots). Sources/targets are trimmed to tolerate CMS typos.
 */
function liveItems(
  template: CdsArticleTemplate,
  organismId: string,
  article: ArticleCustomEntity
): Record<string, unknown>[] {
  const binding = template.data_binding?.dynamic_fields.find(
    (entry) => entry.organism_id === organismId
  );
  const fieldMap = (binding?.field_map.dynamic_fields ?? []).map((entry) => ({
    source: entry.source.trim(),
    target: entry.target.trim(),
  }));
  return resolveBoundItems(fieldMap, article);
}

interface ArticleOrganism {
  /** The `custom_entity`/template key and `schema_slug`. */
  templateKey: string;
  build: (
    template: CdsArticleTemplate,
    article: ArticleCustomEntity
  ) => Record<string, unknown>;
}

/** Fixed render order for the article-detail page. */
export const ARTICLE_TEMPLATE_ORDER: ArticleOrganism[] = [
  {
    templateKey: "articlehero",
    build: (template, article) => {
      const post = articlePost(article);
      const fallback = templateFields(template, "articlehero");
      const cover = flattenMedia(post.media_file_banner);
      const excerpt = asText(post.summary) || asText(post.short_description);
      return {
        identifier: "article-hero",
        cover_image: cover || flattenMedia(fallback.cover_image),
        excerpt: (excerpt || asText(fallback.excerpt)).trim() || undefined,
      };
    },
  },
  {
    templateKey: "articleheader",
    build: (template, article) => {
      const post = articlePost(article);
      const fallback = templateFields(template, "articleheader");
      const title = asText(post.title) || asText(fallback.title);
      const published =
        formatDate(
          post.formatted_first_published_at_datetime ?? post.published_at_datetime
        ) || asText(fallback.published_at);
      return {
        identifier: "article-header",
        title: title.trim(),
        published_at: published.trim() || undefined,
      };
    },
  },
  {
    templateKey: "articlesummary",
    build: (template, article) => {
      const post = articlePost(article);
      const summary = asText(post.summary).trim();
      const fallback = innerItems(
        templateFields(template, "articlesummary").key_points
      );
      const points = summary ? [{ text: summary }] : fallback;
      return {
        identifier: "article-summary",
        key_points: points.map((point) => ({ text: asText(point.text) })),
      };
    },
  },
  {
    templateKey: "articlebody",
    build: (template, article) => {
      const post = articlePost(article);
      const fallback = templateFields(template, "articlebody");
      // The post card has no full `content`; fall back to its summary text
      // before the template default.
      const body =
        asText(post.content) ||
        asText(post.content_html) ||
        asText(post.summary) ||
        asText(post.short_description) ||
        asText(fallback.body);
      return { identifier: "article-body", body };
    },
  },
  {
    templateKey: "sharebar",
    build: (template) => {
      // No article-page data — inline template content only.
      const fallback = templateFields(template, "sharebar");
      return {
        identifier: "share-bar",
        share_buttons: innerItems(fallback.share_buttons).map((button) => ({
          platform_name: asText(button.platform_name),
          icon: flattenMedia(button.icon),
        })),
      };
    },
  },
  {
    templateKey: "tagsrow",
    build: (template, article) => {
      const live = liveItems(template, "tags-row", article);
      const fallback = innerItems(templateFields(template, "tagsrow").article_tags);
      const source = live.length > 0 ? live : fallback;
      return {
        identifier: "tags-row",
        tags: source.map((tag) => ({ title: asText(tag.title) })),
      };
    },
  },
  {
    templateKey: "relatedarticlesrow",
    build: (template, article) => {
      const live = liveItems(template, "related-articles", article);
      const fallback = innerItems(
        templateFields(template, "relatedarticlesrow").related_cards
      );
      const fromLive = live.length > 0;
      const source = fromLive ? live : fallback;
      const currentUrl = stripSlash(asText(articlePost(article).legacy_url));
      const cards = dedupeExcludingCurrent(
        source.map((card) => ({
          title: asText(card.title).trim(),
          thumbnail: fromLive
            ? asText(card.thumbnail)
            : flattenMedia(card.thumbnail),
          category_label: card.category_label,
          url_slug: fromLive ? asText(card.url_slug) : undefined,
        })),
        currentUrl
      );
      return { identifier: "related-articles", cards };
    },
  },
  {
    templateKey: "morefromauthorrow",
    build: (template, article) => {
      const live = liveItems(template, "more-from-author", article);
      const fallback = innerItems(
        templateFields(template, "morefromauthorrow").author_articles
      );
      const fromLive = live.length > 0;
      const source = fromLive ? live : fallback;
      const currentUrl = stripSlash(asText(articlePost(article).legacy_url));
      const articles = dedupeExcludingCurrent(
        source.map((item) => ({
          title: asText(item.title).trim(),
          thumbnail: fromLive
            ? asText(item.thumbnail)
            : flattenMedia(item.thumbnail),
          published_at: item.published_at,
          url_slug: fromLive ? asText(item.url_slug) : undefined,
        })),
        currentUrl
      );
      return { identifier: "more-from-author", articles };
    },
  },
  {
    templateKey: "articlefooter",
    build: (template) => {
      // No article-page data — inline template content only.
      const fallback = templateFields(template, "articlefooter");
      return {
        identifier: "article-footer",
        publisher_name: asText(fallback.publisher_name),
        copyright_text: asText(fallback.copyright_text),
        logo: flattenMedia(fallback.logo) || undefined,
      };
    },
  },
];

/**
 * Build props for one article organism: article-page data first, the template's
 * inline content as fallback. Returns `null` when this template variant does not
 * include the organism.
 */
export function buildArticleProps(
  template: CdsArticleTemplate,
  article: ArticleCustomEntity,
  organism: ArticleOrganism
): Record<string, unknown> | null {
  if (!template[organism.templateKey]) return null;
  return organism.build(template, article);
}
