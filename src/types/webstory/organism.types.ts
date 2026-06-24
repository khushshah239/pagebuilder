/** Presentational contracts for the Web Story player. */

export interface WebStorySlide {
  img?: string;
  title?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
}

export interface WebStoryPlayerProps {
  slides: WebStorySlide[];
  animation?: string;
  publisherName?: string;
}
