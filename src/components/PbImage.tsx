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
  placeholder?: "blur" | "none";
  className?: string;
  "aria-hidden"?: boolean;
}

const DEFAULT_SIZES = "(max-width: 600px) 90vw, (max-width: 1024px) 45vw, 320px";

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
  placeholder = "blur",
  className,
  ...rest
}: PbImageProps) {
  if (!src) return null;

  const blur =
    placeholder === "blur"
      ? { placeholder: "blur" as const, blurDataURL: makeBlurDataUrl(src) }
      : {};

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
        style={{ objectFit: "cover" }}
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
  };

  return (
    <span className={className} style={wrapperStyle} {...rest}>
      <Image
        loader={cdnLoader}
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? DEFAULT_SIZES}
        style={{ objectFit: "cover" }}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        {...blur}
      />
    </span>
  );
}
