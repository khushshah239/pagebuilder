import { CDS_BASE_URL, CDS_PUBLISHER_ID, buildAuthorizationHeader } from "@/config/env";
import { REVALIDATE_SECONDS } from "@/config/cds";

/**
 * Low-level CDS HTTP client. Every page-specific API module builds its request
 * path with `cdsUrl(...)` and fetches it through `cdsFetch(...)`, so auth, the
 * publisher prefix, caching, timeouts, retries, and error handling live in
 * exactly one place.
 */

/** How long a single CDS request may take before it is aborted (ms). */
const REQUEST_TIMEOUT_MS = 12_000;
/** How many extra attempts to make after the first one fails transiently. */
const MAX_RETRIES = 2;
/** HTTP statuses worth retrying — transient timeouts / overload. */
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Build an absolute CDS URL: `${base}/publisher/${id}${path}`. */
export function cdsUrl(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${CDS_BASE_URL}/publisher/${CDS_PUBLISHER_ID}${suffix}`;
}

/**
 * CDS path that fetches a post (homepage entity, article, …) by its legacy URL.
 * Every page resolves its entity through this single endpoint, so the path shape
 * is defined here rather than repeated in each page's API module.
 */
export function postByLegacyUrlPath(legacyUrl: string): string {
  return `/post/?legacy_url=${legacyUrl}`;
}

/** Caching directive: always-fresh (no cache) when the window is 0, else ISR. */
function cacheInit(): RequestInit {
  return REVALIDATE_SECONDS > 0
    ? { next: { revalidate: REVALIDATE_SECONDS } }
    : { cache: "no-store" };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** One attempt: fetch with an abort timeout so a hung request fails fast. */
async function fetchOnce(url: string, headers: Record<string, string>): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { headers, signal: controller.signal, ...cacheInit() });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch a CDS endpoint and parse it as JSON. Adds Basic auth when configured,
 * applies the cache directive, and retries transient failures (timeouts, 5xx,
 * 429) with a short backoff so a single slow CDS response doesn't crash the page.
 *
 * @throws Error when every attempt fails or the response is a non-retryable error.
 */
export async function cdsFetch<T>(path: string): Promise<T> {
  const url = cdsUrl(path);
  const authorization = buildAuthorizationHeader();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (authorization) headers.Authorization = authorization;

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetchOnce(url, headers);

      if (response.ok) {
        return (await response.json()) as T;
      }

      // Retry transient statuses; fail fast on the rest (e.g. 401/404).
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_RETRIES) {
        throw new Error(
          `CDS request failed (${response.status} ${response.statusText}): ${path}`
        );
      }
      lastError = new Error(`CDS ${response.status} on ${path}`);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES) break;
    }

    // Backoff before the next attempt: 400ms, then 1000ms.
    await wait(400 + attempt * 600);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`CDS request failed after ${MAX_RETRIES + 1} attempts: ${path}`);
}
