# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 3001
npm run build      # Production build
npm run start      # Start production server on port 3001
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (no emit, type errors only)
```

There is no test suite — `typecheck` and `lint` are the verification steps.

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CDS_BASE_URL` | CDS host (default: `https://cds-beta.thepublive.com`) |
| `NEXT_PUBLIC_CDS_PUBLISHER_ID` | Numeric publisher ID for CDS requests |
| `CDS_USERNAME` / `CDS_PASSWORD` | HTTP Basic auth — server-only, never exposed to browser |
| `NEXT_PUBLIC_PUBLISHER_KEY` | Selects the active publisher from `src/config/publishers.ts` |

## Architecture

**Next.js 15 App Router, React 19, TypeScript, SCSS Modules.**

All data comes from the CDS (Content Delivery System) at `cds-beta.thepublive.com`. There is no database. CDS returns both live data and the page template (layout order + field bindings) in the same response.

### Routing

Two routes handle everything:

- `app/page.tsx` — homepage; fetches `HomepageCustomEntity` by `HOMEPAGE_LEGACY_URL`.
- `app/[...slug]/page.tsx` — catch-all; runs `identifyUrl` + `loadPost` in parallel, then branches to one of five renderers: **category → SectionPage**, **member → AuthorPage**, **tag → TagPage**, **webstory → WebStoryPlayer**, **video → VideoRenderer**, **article → ArticleRenderer**.

### Organism rendering pipeline

Every page type follows the same pattern:

1. **Fetch** — `src/api/*Api.ts` calls `cdsFetch()` which handles auth, timeout, retry, and ISR caching.
2. **Build props** — `src/lib/*/buildProps.ts` iterates `template.layout`, matches each node's `schema_slug` against `ORGANISM_SPECS`, and calls `buildOrganismProps`.
3. **Render** — `src/components/*/Renderer.tsx` maps `schema_slug → organism component` and renders in layout order.

**Field-map binding** (`src/lib/bindings.ts` → `resolveBoundItems`): the CDS template carries a `bindings.dynamic_fields` array pairing `organism_id → field_map`. Each field-map entry is a `{ source, target }` dot-path pair. `resolveBoundItems` reads the source paths from the live data object, groups by array-index prefix, writes to target paths, and drops empty items. When no live items resolve, the organism falls back to its `dynamic_fields` inline template defaults.

**Shared organism helpers** (`src/lib/cds/organism.ts`):
- `firstDynamicField(node)` — the organism's inline default block.
- `organismId(node)` — binding id, falls back to `schema_slug`.
- `bindingFor(template, id)` — returns the field-map for a given id.
- `defaultItems(node, slot)` — default item array from a named slot inside the inline defaults.

**Media flattening** (`src/lib/media.ts`): CDS media fields are objects with `absolute_path`/`path`. `flattenMedia` extracts the URL string. `MEDIA_KEYS` (image, thumbnail, background_image, etc.) determines which prop names get flattened automatically via `flattenMediaFields`.

### Publisher / theming

`src/config/publishers.ts` is the publisher registry. Each `PublisherConfig` entry holds `cdsPublisherId`, logo URLs, and a `ThemeTokens` object. `NEXT_PUBLIC_PUBLISHER_KEY` selects the active entry.

`src/theme/cssVariables.ts` maps `ThemeTokens → --pb-* CSS custom properties` applied as an inline style on `.pb-root` in `app/layout.tsx`. Every SCSS module references only `--pb-*` vars — swapping the publisher key reskins the entire UI without touching component files.

**To onboard a new publisher:** add a `PublisherConfig` entry to `src/config/publishers.ts` and set `NEXT_PUBLIC_PUBLISHER_KEY` to its `key`.

### Adding a new organism

1. Add a spec entry to `ORGANISM_SPECS` in the relevant `src/lib/*/buildProps.ts`.
2. Create the organism component in `src/organisms/<page-type>/`.
3. Register it in the `ORGANISM_COMPONENTS` map in `src/components/<page-type>/Renderer.tsx`.
4. Add the SCSS module at `src/styles/organisms/<page-type>/`.

### CDS configuration

`src/config/cds.ts` holds legacy URLs for each page-type template and `REVALIDATE_SECONDS` (0 = `no-store`; raise for ISR in production). `cdsFetch` uses these to configure Next.js fetch cache.
