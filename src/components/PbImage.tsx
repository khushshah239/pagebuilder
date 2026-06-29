"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { cdnLoader, makeBlurDataUrl } from "@/lib/imageLoader";

type Fixed = { width: number; height: number };

export interface PbImageProps {
  src: string;
  alt: string;
  /** Reserved up front to prevent layout shift. Ignored in `fixed`/`fillParent` mode. */
  aspectRatio?: number;
  sizes?: string;
  /** Set true ONLY for the above-fold LCP image (disables lazy, hints high priority). */
  priority?: boolean;
  /** Fixed width/height mode for avatars, logos and icons. */
  fixed?: Fixed;
  /** Fill a parent that already reserves space (must be position:relative). */
  fillParent?: boolean;
  /** "cover" (default) crops to fill the box; "contain" shows the full image, letterboxed. */
  objectFit?: "cover" | "contain";
  /** Renders at the image's own aspect ratio (read from its CDN /fit-in/ box) — full width, no crop, no letterbox. */
  natural?: boolean;
  placeholder?: "blur" | "none";
  className?: string;
  "aria-hidden"?: boolean;
}

const DEFAULT_SIZES = "(max-width: 600px) 90vw, (max-width: 1024px) 45vw, 320px";
const FIT_IN_RE = /\/fit-in\/(\d+)x(\d+)\//;

/** Reads the source image's own box ratio (height/width) from its CDN /fit-in/ box. */
function sourceRatio(src: string): number {
  const match = src.match(FIT_IN_RE);
  if (!match) return 9 / 16;
  return Number(match[2]) / Number(match[1]) || 9 / 16;
}

/**
 * The one image primitive for CDS content. Wraps next/image with the CDN loader,
 * an aspect-ratio reservation (kills CLS), lazy-by-default loading, and a blur
 * placeholder. `fixed` renders intrinsic width/height; otherwise it fills a
 * ratio-locked wrapper.
 */
export function PbImage({
  src,
  alt,
  aspectRatio = 16 / 10,
  sizes,
  priority = false,
  fixed,
  fillParent = false,
  objectFit = "cover",
  natural = false,
  placeholder = "blur",
  className,
  ...rest
}: PbImageProps) {
  if (!src) return null;

  const blur =
    placeholder === "blur"
      ? { placeholder: "blur" as const, blurDataURL: makeBlurDataUrl(src) }
      : {};

  if (natural) {
    const ratio = sourceRatio(src);
    return (
      <Image
        loader={cdnLoader}
        src={src}
        alt={alt}
        width={1200}
        height={Math.round(1200 * ratio)}
        className={className}
        style={{ width: "100%", height: "auto", display: "block" }}
        sizes={sizes ?? DEFAULT_SIZES}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        {...blur}
        {...rest}
      />
    );
  }

  if (fixed) {
    return (
      <Image
        loader={cdnLoader}
        src={src}
        alt={alt}
        width={fixed.width}
        height={fixed.height}
        className={className}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        {...blur}
        {...rest}
      />
    );
  }

  if (fillParent) {
    return (
      <Image
        loader={cdnLoader}
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? DEFAULT_SIZES}
        className={className}
        style={{ objectFit }}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        {...blur}
        {...rest}
      />
    );
  }

  const wrapperStyle: CSSProperties = {
    position: "relative",
    display: "block",
    width: "100%",
    aspectRatio: String(aspectRatio),
    overflow: "hidden",
    background: objectFit === "contain" ? "var(--pb-muted-bg, #ececec)" : undefined,
  };

  return (
    <span className={className} style={wrapperStyle} {...rest}>
      <Image
        loader={cdnLoader}
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? DEFAULT_SIZES}
        style={{ objectFit }}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        {...blur}
      />
    </span>
  );
}
