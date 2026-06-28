import type { ImageLoaderProps } from "next/image";

// CDS images are served by a thumbor CDN that encodes the target box as
// /fit-in/<W>x<H>/. Rewriting that box to the width next/image requests lets
// next/image build a real responsive srcset of CDN URLs served straight from
// the edge — Next never proxies the bytes through /_next/image.
const FIT_IN_RE = /\/fit-in\/(\d+)x(\d+)\//;

/** Custom next/image loader: resizes the CDN /fit-in/ box to the requested width. */
export function cdnLoader({ src, width, quality }: ImageLoaderProps): string {
  const match = src.match(FIT_IN_RE);
  if (!match) return src; // non-CDN asset (logo, icon) — leave untouched
  const ratio = Number(match[2]) / Number(match[1]) || 9 / 16;
  const height = Math.round(width * ratio);
  const sized = src.replace(FIT_IN_RE, `/fit-in/${width}x${height}/`);
  return quality
    ? sized.replace("/fit-in/", `/filters:quality(${quality})/fit-in/`)
    : sized;
}

// Neutral shimmer matching --pb-muted-bg, for assets without a /fit-in/ box.
// Pre-encoded as a utf8 data URI so this module stays browser-safe (no Buffer).
const SHIMMER =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='10'%3E%3Crect%20width='16'%20height='10'%20fill='%23f3f1ec'/%3E%3C/svg%3E";

/** Sub-KB blur placeholder: a ~16px CDN variant preserving the source ratio. */
export function makeBlurDataUrl(src: string): string {
  const match = src.match(FIT_IN_RE);
  if (!match) return SHIMMER;
  const ratio = Number(match[2]) / Number(match[1]) || 9 / 16;
  return src.replace(FIT_IN_RE, `/fit-in/16x${Math.max(1, Math.round(16 * ratio))}/`);
}
