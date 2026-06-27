import "server-only";
import { CDS_BASE_URL, CDS_PUBLISHER_ID, buildAuthorizationHeader } from "@/config/env";
import { REVALIDATE_SECONDS } from "@/config/cds";

/** Max duration (ms) before a CDS request is aborted. */
const REQUEST_TIMEOUT_MS = 12_000;
/** Number of retries after the first attempt. */
const MAX_RETRIES = 1;
/** HTTP statuses that warrant a retry (transient errors). */
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Builds an absolute CDS URL for the configured publisher. */
export function cdsUrl(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${CDS_BASE_URL}/publisher/${CDS_PUBLISHER_ID}${suffix}`;
}

/** Returns the CDS path for fetching a post by its legacy URL. */
export function postByLegacyUrlPath(legacyUrl: string): string {
  return `/post/?legacy_url=${encodeURIComponent(legacyUrl)}`;
}

/** Returns Next.js cache config: no-store when REVALIDATE_SECONDS is 0, else ISR. */
function cacheInit(): RequestInit {
  return REVALIDATE_SECONDS > 0
    ? { next: { revalidate: REVALIDATE_SECONDS } }
    : { cache: "no-store" };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Fetches once with a timeout implemented via Promise.race — no AbortSignal so
 *  Next.js native fetch ISR cache is not bypassed. */
async function fetchOnce(url: string, headers: Record<string, string>): Promise<Response> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`CDS request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`)), REQUEST_TIMEOUT_MS)
  );
  return Promise.race([
    fetch(url, { headers, ...cacheInit() }),
    timeoutPromise,
  ]);
}

/** Fetches a CDS endpoint as JSON with auth, caching, and retry on transient errors. */
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

      // Fail fast on non-retryable statuses (e.g. 401/404).
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_RETRIES) {
        const err = new Error(
          `CDS request failed (${response.status} ${response.statusText}): ${path}`
        ) as Error & { status: number };
        err.status = response.status;
        throw err;
      }
      lastError = new Error(`CDS ${response.status} on ${path}`);
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES) break;
    }

    // Exponential backoff with jitter — avoids thundering-herd on CDS degradation.
    await wait((400 + attempt * 600) * (0.5 + Math.random() * 0.5));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`CDS request failed after ${MAX_RETRIES + 1} attempts: ${path}`);
}
