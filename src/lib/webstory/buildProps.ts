// Builds slides directly from content_json — no template, no binding.
import type { WebStorySlide } from "@/types/webstory/organism.types";

function toSlide(raw: Record<string, unknown>): WebStorySlide {
  return {
    img: (raw.img_src as string) ?? "",
    title: raw.title as string | undefined,
    description: raw.desc as string | undefined,
    cta_text: raw.cta_text as string | undefined,
    cta_link: raw.cta_link as string | undefined,
  };
}

export function buildWebStory(
  story: Record<string, unknown>
): { slides: WebStorySlide[]; animation: string } {
  const contentJson = (story.content_json ?? {}) as {
    data?: { web_story?: unknown };
    story_animation?: unknown;
  };

  const rawSlides = Array.isArray(contentJson.data?.web_story)
    ? (contentJson.data!.web_story as Record<string, unknown>[])
    : [];

  const slides = rawSlides
    .map(toSlide)
    .filter((slide) => slide.img || slide.title || slide.description);

  const animation =
    typeof contentJson.story_animation === "string"
      ? contentJson.story_animation
      : "";

  return { slides, animation };
}
