# PageBuilder — Code Review

## Performance Issues (Fixed)

### P0: `react/cache` used where `unstable_cache` needed

**Root cause of all slowness.** `react/cache` deduplicates calls *within a single request* only — it resets every render. Between requests every fetch hits CDS fresh. In `next dev` the Next.js fetch-level cache is also disabled, making this worse.

`unstable_cache` (from `next/cache`) persists data in memory across requests with a configurable TTL. It works in both dev and production.

**Affected files (all fixed):**

| File | Function | Old | Fixed |
|---|---|---|---|
| `src/api/navApi.ts` | `fetchNavigation` | `react/cache` | `unstable_cache` 60s |
| `src/api/footerApi.ts` | `fetchFooter` | `react/cache` | `unstable_cache` 60s |
| `src/api/publisherApi.ts` | `fetchPublisherData` | `react/cache` | `unstable_cache` 300s |
| `src/api/sectionApi.ts` | `fetchSectionTemplate` | `react/cache` | `unstable_cache` 300s |
| `src/api/authorApi.ts` | `fetchAuthorTemplate` | `react/cache` | `unstable_cache` 300s |
| `src/api/tagApi.ts` | `fetchTagTemplate` | `react/cache` | `unstable_cache` 300s |
| `app/page.tsx` | homepage fetch | no cache | `unstable_cache` 60s |

**Before (every request re-fetches from CDS):**
```ts
// navApi.ts
import { cache } from "react";
export const fetchNavigation = cache(async (): Promise<NavItem[]> => {
  const res = await cdsFetch<NavResponse>("/navbar/");
  return Array.isArray(res.data) ? res.data : [];
});
```

**After (cached across requests, TTL 60s):**
```ts
import { unstable_cache } from "next/cache";
export const fetchNavigation = unstable_cache(
  async (): Promise<NavItem[]> => {
    const res = await cdsFetch<NavResponse>("/navbar/");
    return Array.isArray(res.data) ? res.data : [];
  },
  [`${CDS_PUBLISHER_ID}-navigation`],
  { revalidate: 60 }
);
```

---

### P0: Layout fetch waterfall (Fixed)

`RootLayout` awaited `fetchPublisherData()` before rendering `<Navbar>` and `<Footer>`. Those children then started their own fetches *after* the parent resolved — a sequential waterfall of 3 CDS calls.

**Before:**
```tsx
// app/layout.tsx
export default async function RootLayout({ children }) {
  const publisherData = await fetchPublisherData(); // CDS call 1
  // Navbar renders here → fetchNavigation() + fetchFooter()  (calls 2 & 3)
  // Footer renders here → fetchFooter() again               (deduped by cache)
  return ...
}
```

**After (all three fire in parallel):**
```tsx
const [publisherData] = await Promise.all([
  fetchPublisherData(),
  fetchNavigation(),  // pre-warm cache
  fetchFooter(),      // pre-warm cache
]);
```

---

## Code Quality Issues (Not Fixed — Learning Material)

### 1. `<img>` instead of `<Image>` from `next/image`

**Files:** `app/layout.tsx:34`, `src/components/footer/Footer.tsx:39`

Next.js provides an `<Image>` component that automatically generates WebP variants, adds `srcset`, lazy-loads, and avoids CLS by reserving layout space. Plain `<img>` tags get none of this.

**Current:**
```tsx
// app/layout.tsx
<img
  className="pb-brand-logo"
  src={logoUrl}
  alt={publisher.name}
  width={260}
  height={60}
/>
```

**Improved:**
```tsx
import Image from "next/image";

<Image
  className="pb-brand-logo"
  src={logoUrl}
  alt={publisher.name}
  width={260}
  height={60}
  priority  // above the fold — skip lazy loading
/>
```

---

### 2. Duplicated `SOCIAL_ICONS` map

**Files:** `src/components/nav/Navbar.tsx`, `src/components/footer/Footer.tsx`

Identical SVG icon maps are defined in both files. If you add a new platform (e.g. Threads), you need to update two places and they can drift.

**Fix:** Extract to a shared file.

```ts
// src/components/SocialIcons.tsx
import type { ReactElement } from "react";

export const SOCIAL_ICONS: Record<string, ReactElement> = {
  Facebook: <svg ...>,
  Twitter:  <svg ...>,
  // ...
};
```

Then import in both Navbar and Footer:
```ts
import { SOCIAL_ICONS } from "@/components/SocialIcons";
```

---

### 3. `fetchFooter()` called in two components

**Files:** `src/components/nav/Navbar.tsx:29`, `src/components/footer/Footer.tsx:27`

The Navbar only needs `socialLinks` from the footer response, but it calls the full `fetchFooter()`. Now that `fetchFooter` is `unstable_cache`d this is a cache hit on the second call (fine), but it's semantically surprising — a nav component that depends on footer data.

**Option A:** Pass `socialLinks` as a prop from layout (cleaner separation):
```tsx
// layout.tsx
const [publisherData, , footer] = await Promise.all([
  fetchPublisherData(), fetchNavigation(), fetchFooter(),
]);
return (
  <Navbar socialLinks={footer.socialLinks ?? []} />
  <Footer />
)
```

**Option B:** Keep as-is since `unstable_cache` makes it a memory read.

---

### 4. Loose `as unknown as Record<string, unknown>` casts

**Files:** `app/[...slug]/page.tsx` (many places), `src/api/homepageApi.ts:19`

These casts bypass TypeScript's type system and hide bugs. They suggest the CDS response types don't match the actual runtime shape.

**Current:**
```ts
const root = response as unknown as { data?: ArticleData };
const postData = root.data ?? {};
```

**Improved:** Define a proper type that matches the actual CDS envelope:
```ts
interface CdsEnvelope<T> {
  data?: T;
}

// Then in cdsFetch:
export async function cdsFetch<T>(path: string): Promise<CdsEnvelope<T>> { ... }
```

This lets TypeScript catch mismatches at the call site.

---

### 5. `generateMetadata` and page both call `loadPost`

**File:** `app/[...slug]/page.tsx:97,230`

`generateMetadata` calls `loadPost(slug)`. For article pages the page function also calls `loadPost(slug)`. The network call is deduplicated by `react/cache` on `fetchArticle`, but `loadPost` itself is not memoized and runs twice. Also, for category/tag/author pages `generateMetadata` fires a wasted article fetch that returns null.

**Improvement:** Wrap metadata in `unstable_cache` per slug, or accept the current behavior — it's only one extra `try/catch` call with a cache hit on `fetchArticle`.

---

### 6. `fetchRelatedArticles` fetches `limit + 1` then filters

**File:** `src/api/articleApi.ts:16`

```ts
const path = `/posts/?type__eq=Article&categories.slug__eq=${categorySlug}&limit=${limit + 1}`;
const all = Array.isArray(response.data) ? response.data : [];
return { data: all.filter((a) => a.id !== excludeId).slice(0, limit) };
```

This fetches one extra article to account for the current article potentially being in the results, then client-filters. Two problems:
- If the current article is not in the first `limit + 1` results, you return `limit` articles with no filtering needed but you wasted bandwidth fetching the extra.
- If the current article is in the results, you get `limit - 1` articles (the slice takes fewer after filtering).

**Improvement:** Check if CDS supports an `id__ne` exclude filter. If not, fetch `limit` and accept the occasional off-by-one. The current code is logically wrong when the excluded article is in the result set.

```ts
// fetch exactly what you need; exclude filter is cleaner if API supports it
const path = `/posts/?type__eq=Article&categories.slug__eq=${categorySlug}&id__ne=${excludeId}&limit=${limit}`;
```

---

### 7. `prefetch={false}` on all nav links

**File:** `src/components/nav/Navbar.tsx:44`

```tsx
<Link href={item.link} prefetch={false} ...>
```

`prefetch={false}` disables Next.js's link prefetching on hover/viewport-enter. This makes navigation between pages feel slower because the JS bundle and data for the next page aren't fetched until the user actually clicks. It's appropriate for external links but hurts UX for internal links.

**Improvement:** Remove `prefetch={false}` from internal links. The flag is already correct-by-default for external `href` values.

---

### 8. Errors silently swallowed with empty returns

**Files:** `src/api/articleApi.ts`, `src/api/sectionApi.ts`, `src/api/tagApi.ts`, etc.

```ts
} catch {
  return [];  // no logging, no context
}
```

In production this hides CDS outages and config errors. You won't know the nav is broken unless a user reports a missing menu.

**Improvement:** Log at minimum to `console.error` with the URL path:

```ts
} catch (err) {
  console.error(`[CDS] fetchNavigation failed:`, err);
  return [];
}
```

In a real production system you'd also send to a logging/alerting service (Datadog, Sentry, etc.).

---

### 9. `postByLegacyUrlPath` doesn't encode the URL

**File:** `src/api/cdsClient.ts:18`, `src/api/articleApi.ts:66`

```ts
export function postByLegacyUrlPath(legacyUrl: string): string {
  return `/post/?legacy_url=${legacyUrl}`;
}
```

If `legacyUrl` contains `&`, `=`, `#`, or non-ASCII characters (common in news article slugs), the query string breaks silently.

**Fix:**
```ts
export function postByLegacyUrlPath(legacyUrl: string): string {
  return `/post/?legacy_url=${encodeURIComponent(legacyUrl)}`;
}
```

---

### 10. `videoApi.ts` template still uses `react/cache`

**File:** `src/api/videoApi.ts`

`fetchVideoTemplate` still wraps with `cache()` (request-scoped). Video template changes as infrequently as section/author/tag templates. Apply the same `unstable_cache` treatment:

```ts
import { unstable_cache } from "next/cache";

export const fetchVideoTemplate = unstable_cache(
  async (legacyUrl: string): Promise<Record<string, unknown>> => {
    const response = await cdsFetch<{ data?: { custom_entity?: Record<string, unknown> } }>(
      postByLegacyUrlPath(legacyUrl)
    );
    return response.data?.custom_entity ?? {};
  },
  [`${CDS_PUBLISHER_ID}-video-template`],
  { revalidate: 300 }
);
```

Note: `unstable_cache` includes function arguments in the cache key automatically, so per-`legacyUrl` caching is correct.

---

### 11. `new Date().getFullYear()` in server component

**File:** `src/components/footer/Footer.tsx:115`

```tsx
{footer.copyRightText ?? `© ${new Date().getFullYear()} ${publisher.name}. All rights reserved.`}
```

Since `Footer` is a server component, this is evaluated server-side at render time. With `unstable_cache` on `fetchFooter`, the footer HTML is cached — so the year string is frozen at the time of the first fetch. In January it will show the correct year; in December it shows last year until the cache revalidates (5 minutes). Acceptable for a footer, but worth knowing.

---

### 12. `hasSidebarOrganisms` iterates all template keys

**File:** `app/[...slug]/page.tsx:41`

```ts
function hasSidebarOrganisms(post: ArticleData): boolean {
  const template = post.custom_entity?.template?.[0];
  if (!template) return false;
  return Object.values(template).some((v) => {
    const node = v as Record<string, unknown>;
    return (
      typeof node.schema_slug === "string" &&
      (node.schema_slug as string).startsWith("sidebar") &&
      ...
    );
  });
}
```

This iterates all keys in the template object to look for sidebar nodes. The template object has many keys (layout, bindings, etc.) — most aren't organisms. A more targeted check would look only at `template.layout`:

```ts
function hasSidebarOrganisms(post: ArticleData): boolean {
  const template = post.custom_entity?.template?.[0];
  const layout = template?.layout as { schema_slug?: string; dynamic_fields?: unknown[] }[] | undefined;
  return layout?.some(
    (node) =>
      node.schema_slug?.startsWith("sidebar") &&
      Array.isArray(node.dynamic_fields) &&
      node.dynamic_fields.length > 0
  ) ?? false;
}
```

---

## Summary Table

| # | Issue | Severity | Status |
|---|---|---|---|
| P0 | `react/cache` instead of `unstable_cache` for nav/footer/publisher/templates | Critical (slowness) | **Fixed** |
| P0 | Layout fetch waterfall | Critical (slowness) | **Fixed** |
| P0 | Homepage not cached across requests | Critical (slowness) | **Fixed** |
| 1 | `<img>` instead of `next/image` | Medium | Open |
| 2 | Duplicate `SOCIAL_ICONS` | Low | Open |
| 3 | Footer data fetched in two components | Low | Open |
| 4 | Pervasive `as unknown as` casts | Medium | Open |
| 5 | Metadata + page double-fetch for articles | Low | Open |
| 6 | `fetchRelatedArticles` limit+1 logic off-by-one | Low | Open |
| 7 | `prefetch={false}` on internal nav links | Medium | Open |
| 8 | Silent error swallowing | High | Open |
| 9 | `postByLegacyUrlPath` doesn't encode URL | Medium | Open |
| 10 | `videoApi` still uses `react/cache` | Medium | Open |
| 11 | Year frozen in cached footer | Low | Open |
| 12 | `hasSidebarOrganisms` iterates all template keys | Low | Open |
