# CricToday — Modern Editorial Design Spec (Authoritative)

This is the contract. Implementation agents follow it verbatim. Where any auditor proposed an alternative (accent color, radius values, token names), the value below is the single source of truth. Conflicts are resolved; do not reintroduce alternatives.

## 0. Resolved decisions (read first)

| Decision | Resolution | Rationale |
|---|---|---|
| **Single accent** | **Deep pitch green** `#1f6f54` (dark `#14533d`, soft `#eaf2ee`) | Cricket pitch = instant on-brand; green is the rarest sports-news accent (NYT black, Athletic red, ESPN red, Sky blue) → differentiation; desaturated forest reads premium/calm. Vetoes the four competing reds AND the organism auditor's teal/oxblood. |
| **Red** | **Reserved for urgency only** via new `--pb-urgent` `#c8102e` | Red survives ONLY in BreakingNewsStrip + LiveTVBanner "LIVE". Never the brand accent. |
| **Token scales** | Static `:root` block in `globals.css` (invariant) + per-publisher theme tokens via `cssVariables.ts` | Radius/space/type/shadow/transition are publisher-invariant → declare once. Only color + font tokens stay per-publisher. |
| **Radius** | sm `6px` / md `10px` / lg `16px` / pill `999px` | Chrome auditor's small-tasteful scale. (Organism auditor's 14px is folded into `--pb-radius-md` usage for cards — cards use `md`.) |
| **ThemeTokens additions** | `accentSoft`, `ink2` (2 new fields) | Drives category chips/eyebrows + secondary headings. |
| **Heading weight** | **700 max** (display), 600 for section heads | Reconciles chrome auditor's "600" with organism cards already at 700; cap the 800/900 outliers. |
| **Uppercase** | Removed everywhere except ~2-3 true micro-labels at **0.05em max** | Kills the loudest dated signal. |

---

## 1. Final token values

### 1a. ThemeTokens contract — `src/config/theme.types.ts`

Add two fields (additive, non-breaking):

```ts
export interface ThemeTokens {
  accent: string;
  accentDark: string;
  accentSoft: string;   // NEW — 10% tint for chips/eyebrow fills/subtle hovers
  text: string;
  ink2: string;         // NEW — secondary headings / strong meta
  muted: string;
  mutedBg: string;
  border: string;
  pageBg: string;
  surfaceBg: string;
  shadow: string;
  fontFamily: string;
  headingFamily: string;
}
```

### 1b. Variable mapping — `src/theme/cssVariables.ts`

Add the two new mappings; nothing else changes:

```ts
export function themeToCssVariables(theme: ThemeTokens): CSSProperties {
  return {
    "--pb-accent": theme.accent,
    "--pb-accent-dark": theme.accentDark,
    "--pb-accent-soft": theme.accentSoft,   // NEW
    "--pb-text": theme.text,
    "--pb-ink-2": theme.ink2,               // NEW
    "--pb-muted": theme.muted,
    "--pb-muted-bg": theme.mutedBg,
    "--pb-border": theme.border,
    "--pb-page-bg": theme.pageBg,
    "--pb-surface-bg": theme.surfaceBg,
    "--pb-shadow": theme.shadow,
    "--pb-font": theme.fontFamily,
    "--pb-heading-font": theme.headingFamily,
  } as CSSProperties;
}
```

### 1c. Per-publisher tokens — `src/config/publishers.ts`

**CRICTODAY.theme** (replace lines 20–34 wholesale — warm-neutral, green accent, kill the pink):

```ts
theme: {
  accent:       "#1f6f54",  // deep pitch green (AA 4.6:1 large/UI on white)
  accentDark:   "#14533d",  // hover/active + links/small text (AA 7.0:1)
  accentSoft:   "#eaf2ee",  // category chip bg / subtle hover fills
  text:         "#1a1a18",  // warm near-black (body + headings)
  ink2:         "#3d3d39",  // secondary headings / strong meta
  muted:        "#6b6a64",  // warm grey meta (AA 4.6:1 on paper)
  mutedBg:      "#f3f1ec",  // warm sand inset fill
  border:       "#e7e3db",  // true hairline (was heavy #c6c6cd)
  pageBg:       "#faf8f4",  // warm ivory paper (was pink #fcf8fa)
  surfaceBg:    "#ffffff",
  shadow:       "0 4px 12px rgba(26,26,24,0.06), 0 2px 4px rgba(26,26,24,0.04)",
  fontFamily:   SANS_STACK,
  headingFamily: SERIF_STACK,
},
```

**METROPOST.theme** (lines 45–57 — keep navy accent, adopt warm-neutral consistency + new fields):

```ts
theme: {
  accent:       "#1c2a3a",  // ink-navy (modern editorial; replaces bright #1a4fd6)
  accentDark:   "#14202e",
  accentSoft:   "#eef1f6",
  text:         "#15171b",
  ink2:         "#3a3f47",
  muted:        "#5f6873",
  mutedBg:      "#f0f2f6",
  border:       "#e3e6ec",
  pageBg:       "#fafbfc",
  surfaceBg:    "#ffffff",
  shadow:       "0 4px 12px rgba(16,32,78,0.06), 0 2px 4px rgba(16,32,78,0.04)",
  fontFamily:   SANS_STACK,
  headingFamily: SERIF_STACK,
},
```

### 1d. Invariant scales — static `:root` block in `app/globals.css`

Add ONCE, near the top of the file (publisher-invariant — do NOT add to publishers.ts). These provide fallbacks so organisms can drop their red literals AND gain radius/space/type/shadow.

```css
:root {
  /* Dark chrome (warm near-black, not dead #000) */
  --pb-header-bg: #14130f;
  --pb-footer-bg: #14130f;
  --pb-on-dark: #f5f2ec;
  --pb-on-dark-muted: rgba(245, 242, 236, 0.62);

  /* Borders / hairlines */
  --pb-border-strong: #d6d1c7;            /* emphasis dividers only */
  --pb-border-dark: rgba(245, 242, 236, 0.14);  /* hairlines on dark chrome */

  /* Urgency — the ONLY place red survives */
  --pb-urgent: #c8102e;

  /* Radius */
  --pb-radius-sm: 6px;
  --pb-radius-md: 10px;
  --pb-radius-lg: 16px;
  --pb-radius-pill: 999px;

  /* Shadow scale */
  --pb-shadow-sm: 0 1px 2px rgba(26,26,24,0.04), 0 1px 3px rgba(26,26,24,0.06);
  --pb-shadow-md: 0 4px 12px rgba(26,26,24,0.06), 0 2px 4px rgba(26,26,24,0.04);
  --pb-shadow-lg: 0 12px 32px rgba(26,26,24,0.10);
  --pb-shadow-hover: 0 14px 34px rgba(26,26,24,0.10);   /* card hover lift */
  --pb-shadow-overlay: 0 24px 64px rgba(20,19,15,0.22);

  /* Type scale (Playfair headings / Inter body) */
  --pb-fs-xs:   12px;   --pb-lh-xs:   1.4;   /* meta */
  --pb-fs-sm:   14px;   --pb-lh-sm:   1.5;   /* UI / nav / byline */
  --pb-fs-base: 16px;   --pb-lh-base: 1.65;  /* body */
  --pb-fs-md:   18px;   --pb-lh-md:   1.45;  /* card title / lede */
  --pb-fs-lg:   22px;   --pb-lh-lg:   1.3;   /* section head */
  --pb-fs-xl:   28px;   --pb-lh-xl:   1.2;   /* sub-hero */
  --pb-fs-2xl:  clamp(30px, 3vw, 40px);  --pb-lh-2xl: 1.12;  /* page/hero title */
  --pb-fs-3xl:  clamp(40px, 5vw, 60px);  --pb-lh-3xl: 1.08;  /* article H1 */
  --pb-heading-weight: 700;   /* display cap; section heads use 600 inline */

  /* 8pt spacing scale */
  --pb-space-1: 4px;  --pb-space-2: 8px;  --pb-space-3: 12px;  --pb-space-4: 16px;
  --pb-space-5: 24px; --pb-space-6: 32px; --pb-space-7: 48px;  --pb-space-8: 64px;
  --pb-space-9: 96px;
  --pb-gutter: clamp(24px, 4vw, 48px);   /* one gutter for shell/page/section */

  /* Motion */
  --pb-ease: cubic-bezier(0.4, 0, 0.2, 1);
  --pb-dur: 0.18s;
}
```

> Note on the heavy `border-strong`/dark scales (`#d6d1c7`, `#14130f`): these are warm-neutral invariants, not per-publisher. If MetroPost ever needs a cooler dark chrome, promote `--pb-header-bg`/`--pb-footer-bg` into ThemeTokens later — out of scope now.

---

## 2. Canonical card pattern (CSS)

The single shell every vertical image-over-text card converges to: **PostGrid, SectionRow, FeaturedArticles, OpinionEditorialRow, RelatedArticlesRow, InfiniteArticleFeed, MoreFromAuthorRow, TrendingArticlesRow, HeroCarousel sidecards.** No resting border-glow or shadow; separation comes from whitespace + hairline; soft hover lift; accent earns its keep only on the title-hover + eyebrow.

```css
/* ── CANONICAL Modern Editorial article card ───────────────────────────── */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--pb-surface-bg);
  border: 1px solid var(--pb-border);        /* hairline #e7e3db, not #c6c6cd */
  border-radius: var(--pb-radius-md);        /* 10px, not boxy 8px / hard 0 */
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  /* no resting shadow */
  transition: box-shadow var(--pb-dur) var(--pb-ease),
              transform var(--pb-dur) var(--pb-ease),
              border-color var(--pb-dur) var(--pb-ease);
}
.card:hover {
  border-color: transparent;
  box-shadow: var(--pb-shadow-hover);
  transform: translateY(-3px);               /* lift, not scale(1.01) jiggle */
}

/* Full-card click target */
.cardLink { position: absolute; inset: 0; z-index: 1; }

/* Image: 16/10 default, gentle zoom on hover (parent clips). NO brightness/saturate filters. */
.thumb {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
  background: var(--pb-muted-bg);
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  flex-shrink: 0;
}
.card:hover .thumb { transform: scale(1.04); }

.text {
  display: flex;
  flex-direction: column;
  gap: var(--pb-space-3);                     /* 12px */
  padding: var(--pb-space-4) 18px var(--pb-space-5);
  flex: 1;
}

/* Category EYEBROW — quiet text label. Replaces every filled red chip + heavy kicker. */
.category {
  position: relative;
  z-index: 2;
  align-self: flex-start;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;                          /* was 700 */
  text-transform: uppercase;
  letter-spacing: 0.05em;                    /* was 0.07–0.12em */
  color: var(--pb-accent);                   /* green; NO red literal, NO fill */
  transition: color var(--pb-dur);
}
.category:hover { color: var(--pb-accent-dark); }

/* Serif headline — the real hierarchy. */
.title {
  margin: 0;
  font-family: var(--pb-heading-font);
  font-size: var(--pb-fs-md);                /* 18–19px */
  font-weight: var(--pb-heading-weight);     /* 700 */
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--pb-text);                     /* token, not #111 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--pb-dur);
}
.card:hover .title { color: var(--pb-accent); }   /* the one place accent earns its keep */

/* Optional excerpt — muted via token, never a grey literal */
.excerpt {
  margin: 0;
  font-size: var(--pb-fs-sm);
  line-height: 1.55;
  color: var(--pb-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Meta / byline — hairline divider from token, muted text, NO uppercase */
.meta {
  margin-top: auto;
  padding-top: var(--pb-space-3);
  border-top: 1px solid var(--pb-border);    /* kills #e7dccd / #f0f0f0 mix */
  display: flex;
  align-items: center;
  gap: var(--pb-space-2);
  font-size: var(--pb-fs-xs);
  color: var(--pb-muted);
  text-transform: none;                      /* sentence case */
  letter-spacing: 0;
}
```

---

## 3. Chrome rewrite checklist (`app/globals.css` unless noted)

Order = highest visual impact first. Every `var(--pb-accent, #bb0014)` / `#ba0035` fallback is deleted (root sets the var); never pure black borders.

1. **Delete dead CSS first** (de-risks the redesign — see §3 of deep-dive doc). Removes ~150 lines of retired masthead/topbar/ad-rail/progress-bar/search-pagination/filter cruft so you're not restyling dead rules.
2. **Unify dark chrome.** `#0b0b0d` at `.pb-site-header` (L83), `.pb-main-nav` (L232), footer `#111` (L697), `.pb-brand-mark` `#000` (L179) → `var(--pb-header-bg)` / `var(--pb-footer-bg)`. White text on dark → `var(--pb-on-dark)` / `var(--pb-on-dark-muted)`.
3. **Sticky nav premium pass.** `.pb-main-nav` (L228–233): keep sticky; add `border-bottom: 1px solid var(--pb-border-dark)` + `--pb-shadow-sm`. `.pb-nav-links a` (L273–285): drop the 2px hover-underline tab look; hover → `color: var(--pb-on-dark)` with 1px accent underline. Active route = `2px solid var(--pb-accent)` underline (not white). After removing `.pb-nav-social-link`, simplify selector L127 to `.pb-main-nav a:hover`.
4. **Accent swap, global.** Re-point every accent fallback to green (progress-bar already dead; nav/topbar hover L129, subscribe L137/146 — also fix the `#ba0035`/`#920028` self-mismatch, search submit L385, results btn L430, card-category L476 + title hover L494 + author hover L510, footer top-border L699, footer social hover L762, footer-menu-title border L782, search-query L924). `error.tsx` L30 `#c8102e` → `var(--pb-accent)`, L19 muted → `var(--pb-muted)`. `not-found.tsx` L16 `#c8102e` → `var(--pb-accent)`, L13 muted → `var(--pb-muted)`.
5. **Soften borders + add radius.** Swap hard borders for `var(--pb-border)` (topbar L88, header-ad L216, article-layout L639, search-card L442, pagination L520). Add `--pb-radius-md` to `.pb-article-layout`, `.pb-header-ad`, `.pb-search-overlay-box`; `--pb-radius-sm` to `.pb-search-card-img-wrap`, `.pb-search-results-form`. Replace pure-black borders (search-header L873 2px#000, results L408 1.5px#000, filter-tab L897, page-btn L526 1.5px#111) with `1px var(--pb-border-strong)`, accent/ink on active.
6. **De-uppercase.** Remove `text-transform:uppercase` + heavy tracking from topbar-links (L112–113), brand-name (L199 — keep `-0.01em`), brand-tagline (L208), search-submit (L379), search-page-btn (L528), filter-tab (L896). Keep at most 2–3 true micro-labels uppercase at **0.05em max** (header-ad label, search-card-category pill).
7. **Search chrome.** `.pb-nav-search-btn` (L294–307) → low-opacity `--pb-on-dark` bg, `--pb-radius-sm`, accent focus ring. `.pb-search-overlay-submit` (L371–382) → `bg var(--pb-accent)`, `--pb-radius-sm`, sentence-case label, hover `--pb-accent-dark` (not flip to red). `.pb-search-overlay-box` → `--pb-radius-md` + `--pb-shadow-overlay` (replace hard L340).
8. **Footer.** `.pb-site-footer` (L695–700): replace 3px accent border-top (most dated footer signal) with `1px var(--pb-border-dark)` hairline; bg → `var(--pb-footer-bg)`. `.pb-footer-menu-title` (L775–784): drop the 2px accent underline; Playfair 600 + `--pb-space-2` bottom margin only. `.pb-footer-brand-name` 36px → `--pb-fs-xl`. App/social buttons (L749–828): `--pb-radius-sm` + `var(--pb-border-dark)` hairlines.
9. **Containers / rhythm.** `.pb-page` (L580–586): top padding 48→64 (`--pb-space-8`), keep 96 bottom. `.pb-stack` gap 28→`--pb-space-6` (mobile 20→`--pb-space-5`). `.pb-article-layout` gap 36→`--pb-space-6`. Normalize all side gutters (shell L58, page L581, section L595) to `var(--pb-gutter)`.
10. **Subscribe button** (L131–148): green accent/accent-dark pair, radius → `--pb-radius-sm`, weight 700→600.

---

## 4. Per-organism-group restyle checklist

**Global sweep (all ~25 modules) — do these first, they're mechanical:**
- Delete every red literal fallback: `var(--pb-accent, #bb0014)` / `#d4111e` / `#ba0035` / `#c8102e` → `var(--pb-accent)`. Same for accent-dark literals (`#920028`/`#a60d17`/`#8b000f`) → `var(--pb-accent-dark)`.
- Replace muted literals `#555/#666/#777/#888/#999/#aaa` → `var(--pb-muted)`.
- Replace hairline literals `#e8e8e8/#f0f0f0/#e7dccd` (the stray warm beige) → `var(--pb-border)`.
- Cap heading weight at **700** (bring 800/900 outliers down). Add `letter-spacing: -0.015em` on large display sizes.
- Cap label tracking at **0.05em**; remove uppercase from meta/byline rows.

**Homepage heroes (HeroCarousel, FeaturedArticles lead, PostGrid lead):** Keep dark immersive slide. HeroCarousel overlay category (`.module.css:104–110`) — convert SOLID red fill → white text eyebrow at 0.05em (or hairline-outlined chip). Drop `#000` carousel bg to a true neutral; keep L→R gradient. `.readMore` button weight → 600. PostGrid lead + FeaturedArticles boxy-12px/hard-1px/flat-shadow → canonical (`--pb-radius-md` + hairline + hover-only `--pb-shadow-hover`); remove `#e7dccd` excerpt underline (PostGrid:95).

**Homepage rails (SectionRow, FeaturedArticles, OpinionEditorialRow, WebStoryRail, VideoBriefingsRail, PhotoGalleryTeaserRail):** Collapse near-identical `.card` shells onto canonical. Section headers (`.head` hairline + serif `.heading`) are already close — set heading weight 700 (OpinionEditorialRow:20 is 800). navBtn hover must NOT flood to solid accent (SectionRow:50–55, OpinionEditorialRow:50–55) → subtle border-darken/translate. OpinionEditorialRow:6 section-bg `color-mix(accent 12%)` → desaturate/drop once accent is green. WebStoryRail (9:16 + gradient) is correct — only re-point accent + fix aspectRatio (see image plan).

**Section dividers — kill the heavy rules (TopStoriesList, RelatedArticlesRow, SidebarLatestNews, AuthorProfileHeader, TagHeroBanner):** Standardize ONE section-header pattern: serif heading (`--pb-heading-font`, `--pb-fs-lg`, weight 600–700, `-0.01em`) + at most a `1px var(--pb-border)` underline. Remove ALL `border-top/bottom: 2–3px #000/accent` rules and ALL `::before` accent tick/bar pseudo-elements (TopStoriesList:8,18–25; RelatedArticlesRow:12,24–32; SidebarLatestNews:6,20; AuthorProfileHeader:6; TagHeroBanner:3).

**ArticleBody:** Re-point links `#bb0014`/hover `#8b000f` (32–41), `li::marker` (82–84) to `--pb-accent`/`--pb-accent-dark`. Blockquote 4px left border → `--pb-accent`; warm bg `#f9f6f3` → `var(--pb-muted-bg)`. figcaption `#888` → `var(--pb-muted)`. "Read more" toggle (134–151): 1.5px#000 invert-pill → `1px var(--pb-border-strong)` hairline + sentence-case (or keep uppercase at 0.05em). **Leave the hardcoded Charter/Iowan reading serif (line 2)** — deliberate premium reading choice.

**ArticleHeader:** `.category` 2px red bottom-border (16–20) → plain eyebrow. `.title` weight 700 good; add `-0.015em`. Header hairline (line 6) fine.

**SidebarLatestNews (heaviest offender):** Remove 3px accent top rule → hairline; remove 2px#000 heading underline; filled red chip (133–138) → text eyebrow; left accent wipe-bar `::before` (58–71) → drop or 2px hairline-accent. Keep reduced-motion block.

**TopStoriesList:** Keep ranked-number concept (editorial), but rank in `var(--pb-muted)` not red (74–82); rule → hairline.

**InfiniteArticleFeed:** Migrate shell to canonical; swap `#888/#f0f0f0` meta literals (95–132) for tokens; drop brightness/saturate hover filter (50). `.metaTop::after { content:'Read →' }` (135–149) fine — muted → accent on hover only.

**AuthorProfileHeader:** border-bottom 2px accent (6) → hairline; name + avatarFallback weight 800 (33,49) → 700. Social hover flood to solid accent (78–81) is acceptable (the one interactive accent moment).

**TagHeroBanner:** border-bottom 3px accent (3) → `2px var(--pb-accent)` kept as the ONE deliberate accent moment on tag pages (or hairline); title weight 900 (11) → 700 + `-0.015em`.

**Video (VideoHero/VideoHeader):** VideoHero structurally clean — confirm radius uses `--pb-radius-md`; keep play-badge text-shadow. VideoHeader: re-point red literals to token.

**TrendingTopicsChips (reference for "calm"):** Already most-modern. Only nit: `#0b0b0d` hover literal (37–53) → `var(--pb-text)`. Use its eyebrow tracking (0.04em) as the alignment target.

**Urgency exception:** BreakingNewsStrip + LiveTVBanner keep filled red — re-point to `var(--pb-urgent)`, NOT `--pb-accent`.
