# Page Builder Web

A configuration-driven, component-based **page builder for publisher news sites**, built with the Next.js App Router. Every page — homepage, articles, videos, category/author/tag listings, web stories and search — is assembled at request time from a **CDS (Content Delivery System)** response that returns both the live content *and* the page template (layout order + field bindings) in a single payload. There is no database.

Swapping a single environment variable re-skins and re-points the entire site to a different publisher.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19 Server Components) |
| Language | TypeScript (strict) |
| Styling | CSS Modules + `--pb-*` design tokens |
| Images | `next/image` with a custom CDN loader |
| Data | CDS REST API (HTTP Basic auth, ISR caching) — no DB |

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in the CDS credentials

# 3. Run
npm run dev                  # http://localhost:3001
```

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (port 3001) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (type errors only) |

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CDS_BASE_URL` | CDS host |
| `NEXT_PUBLIC_CDS_PUBLISHER_ID` | Numeric publisher id for CDS requests |
| `CDS_USERNAME` / `CDS_PASSWORD` | HTTP Basic auth — **server-only**, never exposed to the browser |
| `NEXT_PUBLIC_PUBLISHER_KEY` | Selects the active publisher/theme from `src/config/publishers.ts` |

---

## Architecture

### Routing

Two routes serve everything:

- **`app/page.tsx`** — the homepage.
- **`app/[...slug]/page.tsx`** — a catch-all that runs `identifyUrl` to classify the URL, then branches to the right renderer: **category → author → tag → web story → video → article**.

### The rendering pipeline (fetch → build props → render)

Every page type follows the same three stages:

1. **Fetch** — `src/api/*Api.ts` calls `cdsFetch()`, which handles auth, timeout, retry with backoff, and Next.js ISR caching.
2. **Build props** — `src/lib/*/buildProps.ts` walks the template layout, matches each node's `schema_slug` against an organism spec, and resolves the CDS **field-map bindings** into plain, presentational props.
3. **Render** — `src/components/*/Renderer.tsx` maps `schema_slug → organism component` and renders them in the template's layout order.

Resolution always follows a **progressive fallback chain**: live CDS binding → template inline default → hardcoded default template.

### Field-map binding

The CDS template carries a `bindings` array pairing each `organism_id` with a `field_map` of `{ source, target }` dot-path pairs. `resolveBoundItems` (`src/lib/bindings.ts`) reads each source path from the live data, groups entries by array index, writes them to the target props, and drops empty items — preserving field-map order as render order.

### Dynamic zones (homepage)

The homepage is a flexible **dynamic zone**. Each organism's placement is driven entirely by its name (the CDS `id`), with **no hardcoded slug → column mapping**:

- `full-*` → full-width band
- `right-*` / `sidebar-*` → right column
- anything else → main column

Reordering organisms in the template layout reflects directly on the page, and section headings are derived from the organism id (e.g. `sports-row` → "Sports Row").

### Theming

`src/config/publishers.ts` is the publisher registry; each entry holds a `ThemeTokens` object. `src/theme/cssVariables.ts` maps those tokens to `--pb-*` CSS custom properties applied once on the root element. Every CSS module references only `--pb-*` vars, so switching `NEXT_PUBLIC_PUBLISHER_KEY` re-skins the whole UI without touching a single component.

---

## Project structure

```
app/
  page.tsx              Homepage route
  [...slug]/page.tsx    Catch-all route (articles, video, listings, web stories)
  search/page.tsx       Search results
  layout.tsx            Root layout — nav, footer, theme tokens, fonts
  globals.css           Resets, layout shells, design tokens

src/
  api/         CDS HTTP client + per-resource fetchers (auth, retry, ISR cache)
  lib/         Binding engine, per-page-type buildProps, media/date/url helpers
  components/  Renderers + shared UI (byline, links, image, pagination)
  organisms/   Presentational blocks per page type (homepage / article / video / …)
  config/      env, CDS endpoints, publisher registry, theme types
  theme/       ThemeTokens → CSS variables
  types/       CDS + organism prop contracts
  styles/      One CSS module per organism/component
```

---

## Extending

**Add an organism:** add a spec to the relevant `src/lib/*/buildProps.ts`, create the component in `src/organisms/<page-type>/`, register it in the matching `Renderer.tsx`, and add a CSS module under `src/styles/`.

**Onboard a publisher:** add a `PublisherConfig` entry to `src/config/publishers.ts` and set `NEXT_PUBLIC_PUBLISHER_KEY` to its key.

---

## Verification

There is no unit-test suite; correctness is enforced by the type system and linter:

```bash
npm run typecheck && npm run lint && npm run build
```
