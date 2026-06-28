# CricToday — Smart Image Loading Implementation Plan

Goal: replace 31 raw `<img>` (across 25 files) with one `PbImage` wrapper over `next/image` that (a) reserves aspect ratio (kills CLS), (b) defaults lazy with explicit `priority` opt-in for LCP, (c) drives a custom thumbor CDN loader for per-width negotiation, (d) attaches a sub-KB blur LQIP. This fixes the ~4.4MB / 3.18s image download root cause (full-res originals + wrong `sizes` + 2-size srcset + the lazy LCP lead).

## 1. CDN loader + blur — `src/lib/imageLoader.ts` (new)

A custom loader rewrites the thumbor `/fit-in/<W>x<H>/` segment to the width `next/image` requests, so Next builds a real responsive srcset of CDN URLs served directly by the edge (NOT proxied through `/_next/image`). It preserves the original aspect ratio embedded in the URL.

```ts
import type { ImageLoaderProps } from "next/image";

// Preserve the height:width ratio already in /fit-in/<W>x<H>/, scaling to the
// requested width. Fallback ~16:9 when the source has no ratio.
const FIT_IN_RE = /\/fit-in\/(\d+)x(\d+)\//;

export function cdnLoader({ src, width, quality }: ImageLoaderProps): string {
  const m = src.match(FIT_IN_RE);
  if (!m) return src;                       // non-thumbor (logos/icons) -> untouched
  const [, w, h] = m;
  const ratio = Number(h) / Number(w) || 9 / 16;
  const targetH = Math.round(width * ratio);
  let out = src.replace(FIT_IN_RE, `/fit-in/${width}x${targetH}/`);
  if (quality) out = out.replace("/fit-in/", `/filters:quality(${quality})/fit-in/`);
  return out;
}

// Shimmer fallback for non-/fit-in/ URLs (logos, icons). Uses muted-bg neutral.
const SHIMMER =
  "data:image/svg+xml;base64," +
  Buffer.from(
    "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='10'>" +
    "<rect width='16' height='10' fill='#f3f1ec'/></svg>"   // matches --pb-muted-bg
  ).toString("base64");

// Tiny ~16px CDN variant as a blur LQIP, preserving original ratio. ~300-700B, edge-cached.
export function makeBlurDataUrl(src: string): string {
  const m = src.match(FIT_IN_RE);
  if (!m) return SHIMMER;
  const [, w, h] = m;
  const ratio = Number(h) / Number(w) || 9 / 16;
  return src.replace(FIT_IN_RE, `/fit-in/16x${Math.max(1, Math.round(16 * ratio))}/`);
}
```

## 2. The component — `src/components/PbImage.tsx` (new)

Two layout modes: **fill** (default; responsive cards/heroes/bg, wrapper reserves ratio) and **fixed** (avatars/logos/icons via explicit width/height). The loader is passed per-`<Image>` so static `next/image` logos in Navbar/Footer are unaffected.

```tsx
import Image from "next/image";
import { cdnLoader, makeBlurDataUrl } from "@/lib/imageLoader";

type Fixed = { width: number; height: number };

export interface PbImageProps {
  src: string;
  alt: string;
  aspectRatio?: number;          // ignored when `fixed` is set; default 16/10
  sizes?: string;
  priority?: boolean;            // true ONLY for above-fold LCP
  fixed?: Fixed;
  placeholder?: "blur" | "none";
  className?: string;
  ["aria-hidden"]?: boolean;
}

const DEFAULT_SIZES = "(max-width: 600px) 90vw, (max-width: 1024px) 45vw, 320px";

export function PbImage({
  src, alt, aspectRatio = 16 / 10, sizes, priority = false,
  fixed, placeholder = "blur", className, ...rest
}: PbImageProps) {
  if (!src) return null;                      // mirror existing empty-src guards

  const blur =
    placeholder === "blur"
      ? { placeholder: "blur" as const, blurDataURL: makeBlurDataUrl(src) }
      : {};

  if (fixed) {                                // avatars, logos, icons
    return (
      <Image
        loader={cdnLoader} src={src} alt={alt}
        width={fixed.width} height={fixed.height}
        className={className}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        {...blur} {...rest}
      />
    );
  }

  return (                                    // cards, heroes, backgrounds
    <span
      style={{ position: "relative", display: "block", width: "100%", aspectRatio }}
      className={className} {...rest}
    >
      <Image
        loader={cdnLoader} src={src} alt={alt}
        fill sizes={sizes ?? DEFAULT_SIZES}
        style={{ objectFit: "cover" }}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        {...blur}
      />
    </span>
  );
}
```

## 3. `src/lib/media.ts` changes

- **Keep:** `flattenMedia`, `flattenMediaFields`, `toLocalPath`, `MEDIA_KEYS`, `URL_PATH_KEYS` (unrelated — stay as-is).
- **Keep `widenCdnImage`** but make it pure: **delete the dev-only `console.warn`** (lines 57–59) — it's a side effect in a pure transform and 31 raw imgs spam it. The loader reuses the same `/fit-in/` regex concept.
- **Deprecate then delete `cdnImageSrcSet`** (lines 65–70): superseded by the loader, which generates an 8-rung srcset per requested width instead of a hand-built 2-size set. Remove call sites as organisms migrate, then delete.

## 4. `next.config.mjs` changes

Pin explicit width rungs + quality so the custom loader negotiates a tight intentional set. Do NOT set `unoptimized` (we want Next's srcset generation against our CDN URLs). `compress`/`poweredByHeader`/`experimental` stay.

```js
images: {
  remotePatterns: [{ protocol: "https", hostname: "**" }],
  formats: ["image/avif", "image/webp"],   // add avif (smaller); webp fallback
  minimumCacheTTL: 3600,
  deviceSizes: [360, 640, 768, 1024, 1280, 1600, 1920],  // full-viewport rungs
  imageSizes: [16, 48, 64, 96, 128, 200, 256, 320],      // sub-viewport: 16=LQIP, 48-128 avatars/icons, 200-320 cards
  qualities: [50, 60, 70, 75],             // Next 15 requires allowlist if loader forwards quality
},
```

## 5. Blur placeholder approach

- **Content images (cards, heroes, lead):** `placeholder="blur"` → `makeBlurDataUrl(src)` returns a ~16px-wide CDN variant preserving the real ratio (~300–700B webp, edge-cached, fires with the image). On priority/LCP images the blur shows during the high-priority fetch → kills the white-box-then-pop, improves perceived LCP. No heavy base64 inlined in HTML.
- **Tiny/decorative (icons, logos, small avatars, bg-behind-overlay):** `placeholder="none"` (a blur adds no value behind an overlay or on a 20px icon).
- **Non-`/fit-in/` URLs:** `makeBlurDataUrl` falls back to the inline `SHIMMER` constant (a few bytes, `--pb-muted-bg` neutral).

## 6. Per-usage migration table

| File:line | Mode | priority | aspectRatio | sizes | placeholder | Notes |
|---|---|---|---|---|---|---|
| HeroCarousel.tsx:72 (backdrop) | — | — | — | — | — | **DELETE** — blur LQIP + cover replaces it. Or keep as CSS bg-blur (never priority). |
| HeroCarousel.tsx:81 (image) | fill | `index===0` | 16/10 | `100vw` | blur | Primary homepage LCP. Bump CDN top width via deviceSizes (auto). index>0 lazy. |
| PostGrid.tsx:33 (leadImage) | fill | **`true`** | 16/10 | `(max-width:900px) 100vw, 600px` | blur | **Worst current regression — was `lazy`.** Now priority, NOT lazy. |
| PostGrid.tsx:63 (cardThumb) | fill | `false` | 16/10 | `(max-width:760px) 50vw, 280px` | blur | Above-fold first row — consider `priority` on row 1 to avoid lazy flash. |
| FeaturedArticles.tsx:76 | fill | `false` | 16/10 | `(max-width:600px) 45vw, 300px` | blur | Below fold; tighten oversized 568px. |
| SectionRow.tsx:57 | fill | `false` | 16/10 | `(max-width:600px) 45vw, 300px` | blur | Below fold; tighten sizes. |
| OpinionEditorialRow.tsx:75 | fill | `false` | 16/10 | `(max-width:600px) 45vw, 300px` | blur | Below fold. |
| VideoBriefingsRail.tsx:57 | fill | `false` | 16/10 | `(max-width:600px) 45vw, 300px` | blur | Keep play badge as sibling overlay (wrapper is positioned). |
| WebStoryRail.tsx:90 | fill | `false` | **9/16** | `(max-width:600px) 40vw, 220px` | blur | **Fixes 16:9→9:16 crop**; loader preserves portrait ratio. |
| PhotoGalleryTeaserRail.tsx:26 | fill | `false` | 16/10 | `(max-width:600px) 45vw, 300px` | blur | Overlay sibling. |
| SponsoredContentStrip.tsx:26 | fill | `false` | 16/10 | `(max-width:600px) 45vw, 300px` | blur | Below fold. |
| AppPromoCard.tsx:36 (bg) | fill | `false` | match slot | `100vw` | none | **Raw full-res** → CDN downsize. `alt=""` aria-hidden. |
| NewsletterSignupStrip.tsx:19 (bg) | fill | `false` | match slot | `100vw` | none | **Raw full-res** → CDN downsize. `alt=""` aria-hidden. |
| LiveTVBanner.tsx:16 | fill | `false` | 16/10 | `(max-width:600px) 90vw, 360px` | blur | **Raw full-res**; give explicit ratio (small CLS today). |
| ArticleHero.tsx:17 | fill | **`true`** | 16/9 | `(max-width:768px) 100vw, min(1200px,100vw)` | blur | Article-page LCP. Bump CDN max width (auto via deviceSizes). |
| RelatedArticlesRow.tsx:38 | fill | `false` | 16/9 | `(max-width:600px) 80vw, 300px` | blur | Below fold; tighten sizes. |
| MoreFromAuthorRow.tsx:34 | fill | `false` | 16/9 | `(max-width:600px) 80vw, 300px` | blur | `alt=""` (overlay link announces title). |
| TrendingArticlesRow.tsx:41 + :50 | fill | `false` | 16/9 | `(max-width:600px) 80vw, 300px` | blur | **Both branches collapse to ONE PbImage.** |
| SidebarLatestNews.tsx:52 | fill | `false` | 16/10 | `120px` | blur | **Was claiming 568px for a ~100px thumb** — huge over-fetch. |
| InlineVideoEmbed.tsx:36 (poster) | fill | `false` | 16/9 | `(max-width:768px) 100vw, 720px` | blur | Single fixed 1280x720 today → now responsive. |
| LiveBlogFeed.tsx:63 + :66 | fill | `false` | 16/9 | `(max-width:600px) 80vw, 300px` | blur | **Raw full-res; both branches collapse to ONE PbImage.** |
| LiveBlogFeed.tsx:139 (image) | fill | `false` | 16/9 | `(max-width:768px) 100vw, 680px` | blur | **Raw full-res inline; reserve ratio** to stop CLS as feed grows. |
| ShareBar.tsx:50 (icon) | fixed | `false` | — `{width:24,height:24}` | — | none | Static SVG/PNG; loader passes non-/fit-in/ through. |
| ArticleFooter.tsx:15 (logo) | fixed | `false` | — match logo dims | — | none | Below-fold logo; loader passes through. |
| AuthorProfileHeader.tsx:21 (avatar) | fixed | `false` | — `{width:96,height:96}` | — | none | Above-fold but cheap → not lazy. Request 96/192 square. |
| VideoHeader.tsx:38 (avatar) | fixed | `false` | — `{width:48,height:48}` | — | none | Small above-fold; not lazy. |
| VideoHero.tsx:36 (poster) | fill | **`true`** | 16/9 | `(max-width:768px) 100vw, min(1200px,100vw)` | blur | Video-page LCP when no embed. |
| app/search/page.tsx:70 | fill | `false` | 16/10 | `(max-width:600px) 90vw, 360px` | blur | **Raw full-res**; eslint-disable can be removed once migrated. |

**Net effect:** 3 LCP images get `priority` (HeroCarousel idx0, PostGrid lead, ArticleHero/VideoHero); ~8 raw full-res images get CDN-downsized; every card gets an 8-rung srcset matched to its real `sizes`; the PostGrid lead stops being lazy; WebStory portrait crop is fixed; CLS is reserved everywhere via the fill-wrapper or fixed dims.
