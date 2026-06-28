# CricToday — Modern Editorial Redesign: Deep-Dive Review

## Executive summary

CricToday today reads as "The Gazette" — a boxy, fire-engine-red, heavy-uppercase legacy-newspaper aesthetic. The target is **Modern Editorial** (The Athletic / NYT): refined Playfair headlines, clean Inter body, generous whitespace, one restrained accent, hairline borders, calm premium feel. Four audits (chrome/tokens, organism CSS, images, code cleanliness) converge on three workstreams:

1. **De-red + tokenize.** The entire dated read comes mostly from ONE thing: a saturated red hardcoded as the `--pb-accent` fallback in **25 of ~40 organism modules** (135 grep hits) in *four mutually-inconsistent literals* (`#bb0014`, `#d4111e`, `#ba0035`, `#c8102e`). Changing the theme token alone won't de-red the UI because each module ships its own literal. The fix is a single restrained accent + a global literal-strip sweep.

2. **Soften + calm.** Replace hard 1px/2px/3px black & accent rule-bars, boxy 0–8px corners, and pervasive ALL-CAPS-at-wide-tracking with hairlines, soft radii, whitespace, and at most 2–3 micro-labels at ≤0.05em tracking. Cap heading weight at 700.

3. **Smart images.** Raw `<img>` (31 across 25 files) ship full-res originals with wrong `sizes` and a 2-size srcset; the homepage LCP lead is needlessly `lazy`. A `PbImage` wrapper + custom thumbor CDN loader + blur LQIP fixes the multi-MB/multi-second download.

**The single most consequential decision — resolved here — is the accent color.** Auditors proposed green, ink-teal, and oxblood. **Final: deep pitch green `#1f6f54`** (dark `#14533d`, soft `#eaf2ee`). Cricket's defining surface is the pitch, so a desaturated forest green reads instantly "cricket" without being a club color, and green is the rarest sports-news accent (NYT=black, Athletic=red, ESPN=red, Sky=blue) → instant differentiation while staying calm and premium. Everything downstream is built around this one choice.

---

## 1. UI modernization findings

### 1.1 The accent (highest impact)

**Before** — four reds, none matching each other or `publishers.ts` accent `#ba0035`:
```css
color: var(--pb-accent, #bb0014);   /* PostGrid, SectionRow, ArticleBody… */
background: var(--pb-accent, #ba0035);  /* pb-subscribe — mismatches its own #920028 dark */
border-bottom: 2px solid #c8102e;   /* error.tsx / not-found.tsx — a THIRD/FOURTH red */
```
**After** — one token, no literals, accent demoted to eyebrow + title-hover only:
```css
color: var(--pb-accent);   /* root always sets #1f6f54 — no fallback needed */
```
Red survives ONLY for genuine urgency (BreakingNewsStrip / LiveTVBanner "LIVE") via a new `--pb-urgent` (#c8102e), never the brand accent.

### 1.2 Boxy hard-bordered cards → soft hairline cards

**Before** (PostGrid/SectionRow/FeaturedArticles et al.): every card outlined in a visible `1px solid #c6c6cd`, boxy 8–12px corners, a flat resting `0 4px 12px rgba(15,23,42,0.05)` shadow, and a `scale(1.01)` hover jiggle — a 2010s "portal grid" look.
**After** (canonical card in the spec): hairline `1px var(--pb-border)` (#e7e3db), `--pb-radius-md` (10px), **no resting shadow** (separation via whitespace), and a hover that lifts `translateY(-3px)` + reveals `--pb-shadow-hover` + tints the title to accent. Image zooms `scale(1.04)` with the brightness/saturate filters removed.

### 1.3 Heavy rule-bars & accent ticks → one hairline section header

**Before:** `border-top: 3px solid #000` (TopStoriesList:8), `border-bottom: 3px solid #000` (RelatedArticlesRow:12), `::before` 3–4px accent tick-marks before headings, 2px accent underlines (ArticleHeader/AuthorProfileHeader/TagHeroBanner). Quintessential legacy-newspaper dividers.
**After:** one pattern — serif heading (`--pb-fs-lg`, 600–700, `-0.01em`) + at most a `1px var(--pb-border)` underline. All `::before` ticks and 2–3px bars deleted.

### 1.4 ALL-CAPS noise → calm

**Before:** `text-transform:uppercase` + `letter-spacing: 0.07em–0.12em` + `font-weight:700` on nearly every kicker, eyebrow, meta row, and button (~10 chrome elements + most organisms). The loudest "old newspaper" tic.
**After:** eyebrows stay uppercase but at **0.05em / weight 600 / 11–12px**; meta & bylines go sentence-case muted; only 2–3 true micro-labels keep uppercase. Heading weights 800/900 (AuthorProfileHeader, TagHeroBanner title:900, OpinionEditorialRow:800) capped at **700** with `-0.015em`.

### 1.5 Filled red chips → quiet text eyebrows

**Before:** HeroCarousel (104–110) and SidebarLatestNews (133–138) paint white-on-saturated-red category stickers — a tabloid device.
**After:** category becomes a plain accent/muted text eyebrow (no fill). Solid fills reserved for `--pb-urgent` only.

### 1.6 Dark chrome, pink paper, warm neutrals

**Before:** flat `#0b0b0d`/`#111` dead-black chrome; pink-tinted paper `#fcf8fa`; cool blue-tinted shadow; a stray warm-beige `#e7dccd` hairline leftover from an old sepia theme.
**After:** warm near-black `--pb-header-bg` #14130f; warm ivory `--pb-page-bg` #faf8f4; warm-tinted shadow scale; the `#e7dccd` beige deleted entirely.

### 1.7 Token system (the engine)

`ThemeTokens` gains two fields (`accentSoft`, `ink2`). Radius/space/type/shadow/transition scales are declared ONCE as invariant `:root` vars (not per-publisher). 8pt spacing normalizes the 4–96px chaos; a `--pb-gutter` unifies the inconsistent 48/64/32 side gutters; a ~1.2 modular type scale replaces the ad-hoc 10–36px jumble. Full copy-paste values are in the **Design Spec** deliverable.

---

## 2. Image-loading findings + root cause + fix

### 2.1 Root cause of slowness (~4.4MB / 3.18s download)

Five compounding problems, all from raw `<img>` with hand-rolled or absent responsive logic:

1. **Full-resolution originals** on ~8 images with no srcset and no CDN resize (AppPromoCard:36, NewsletterSignupStrip:19, LiveTVBanner:16, LiveBlogFeed:63/66/139, search/page:70, plus logos/avatars). Thumbor originals are routinely 2000px+ / hundreds of KB.
2. **2-size srcset, too small.** `cdnImageSrcSet` (media.ts:65) emits only 360w + 568w — no 768/1024/1280/1600 rung — so the PostGrid lead and wide slots upscale (blur) while small slots over-fetch.
3. **Wrong `sizes`.** Copy-pasted `(max-width:400px) 360px, 568px` everywhere regardless of real slot: sidebar thumbs (~100px) and share icons claim 568px (over-fetch); the lead claims only 568px while painting wider (under-fetch blur).
4. **No Next srcset/format pipeline** for content images — only logos use `next/image`. `compress:true` gzips HTML/JSON, not images.
5. **No priority + eager/lazy mismatch.** LCP images use `loading="eager"` but get no `fetchpriority`; **the PostGrid lead — an LCP candidate — is `loading="lazy"`**, the single worst LCP regression on the homepage.

CLS is mostly mitigated by aspect-ratio in module CSS, but raw full-res images (LiveBlogFeed timeline, logos, avatars) and the WebStoryRail 16:9-into-9:16 crop remain.

### 2.2 The fix

A `PbImage` wrapper over `next/image` + a custom thumbor loader (`cdnLoader`) that rewrites `/fit-in/<W>x<H>/` to each width Next requests — yielding a real 8-rung srcset of edge-cached CDN URLs (NOT proxied through `/_next/image`), with ratio preserved from the URL (fixes the WebStory crop). Sub-KB blur LQIP via a ~16px CDN variant. `next.config.mjs` pins `deviceSizes`/`imageSizes`/`qualities` and adds avif. Three LCP images get `priority`; the lead stops being lazy; ~8 raw full-res images get downsized; every card's `sizes` is corrected to its real slot. Full component code, loader, config, and a per-usage migration table are in the **Image Plan** deliverable.

---

## 3. Code cleanliness findings

**Dead CSS — the single biggest minimalism win (~150 lines in `app/globals.css`):** the entire retired masthead/topbar era is dead (no consumers; current header is one `<Navbar>`): `.pb-topbar*` (93–124), `.pb-subscribe` (131–148), `.pb-masthead` (150–157), `.pb-brand-mark` (173–185), `.pb-brand-tagline` (202–209), `.pb-header-ad` (211–223) + their mobile rules (847–863). Also dead: `.pb-progress-bar` (63–75), `.pb-nav-social*` (542–575), search pagination (513–535) and filter-tab (878–912) classes, and two `display:none` ad-rail pseudo-element blocks (49–55, 665–677). **Delete these before restyling** — less old-aesthetic cruft to fight.

**Accent fallback split:** `#bb0014` vs `#ba0035` hardcoded across ~10 hover rules — unify to a single token (resolved by the de-red sweep above).

**TypeScript smells:** nine `as unknown as` double-casts duplicated across three near-identical `buildProps` files (section/tag/author) — extract one typed `toFeedArticle` helper (and ideally a shared `buildFeedProps` generic), reducing 9 casts to 1–2. Redundant casts on already-typed `post` in `app/[...slug]/page.tsx` (251, 319) — add the loose fields to `ArticleData`.

**Small dead/stale items:** dead `SOCIAL_ICONS` alias (SocialIcons.tsx:47–48, zero importers); stale orphan comments + redundant `PUB` alias in `app/[...slug]/page.tsx` (39/60–61/63–64/126/193–195); the `console.warn` side effect in `widenCdnImage` (media.ts:57–59). Frozen-year-in-cache (Footer.tsx:97) is low priority (only the no-CDS-copyright fallback).

> Already resolved (do NOT re-flag): duplicate SOCIAL_ICONS map (extracted), `prefetch={false}` scoping (Navbar:48), `postByLegacyUrlPath` encoding (cdsClient:20). No security/correctness regressions found.

---

## 4. Prioritized action table

| # | Priority | Area | Action | Why / impact |
|---|---|---|---|---|
| 1 | **P0** | Tokens | Add `:root` invariant scales + 2 ThemeTokens fields; set CricToday to green warm-neutral palette | Foundation for everything; flips the whole UI's color/rhythm at once |
| 2 | **P0** | Cleanliness | Delete ~150 lines dead CSS (masthead/topbar/ad-rail/progress/search-pagination/filter) | De-risks redesign; biggest minimalism win |
| 3 | **P0** | Images | Add `PbImage` + `cdnLoader` + blur; set `priority` on 3 LCP images; **unlazy PostGrid lead** | Fixes the worst LCP regression + multi-MB download |
| 4 | **P1** | Organisms | Global sweep: strip red/grey/border literals → tokens across 25 modules | Actually de-reds the UI (token alone won't) |
| 5 | **P1** | Organisms | Migrate all card shells to canonical card; remove rule-bars + `::before` ticks | Core Modern-Editorial look |
| 6 | **P1** | Images | Migrate ~8 raw full-res `<img>` (bg/livefeed/search/livetv) through CDN loader; fix `sizes`; fix WebStory 9:16 | Stops over/under-fetch + crop |
| 7 | **P1** | Chrome | Unify dark chrome, soften borders+radius, de-uppercase, footer/nav/search/subscribe passes | Polishes the frame |
| 8 | **P2** | Type | Extract `toFeedArticle` / shared `buildFeedProps`; widen `ArticleData`; remove redundant casts | 9 casts → 1–2 |
| 9 | **P2** | Config | `next.config.mjs`: deviceSizes/imageSizes/qualities + avif | Tight intentional width set |
| 10 | **P3** | Cleanliness | Delete dead `SOCIAL_ICONS` alias, stale comments, `PUB` alias, `widenCdnImage` warn | Minimalism polish |
| 11 | **P3** | Cleanliness | Document/relocate frozen copyright-year fallback (Footer.tsx:97) | Low impact |
