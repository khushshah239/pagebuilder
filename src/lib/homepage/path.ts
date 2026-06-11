/**
 * Resolve a dotted path (e.g. "hero_carousel.results.1.title" or
 * "featured_articles.0.title") against a nested object. Numeric segments index
 * into arrays, so this supports both wrapped (`slot.results.N`) and unwrapped
 * (`slot.N`) data shapes. Returns `undefined` if any segment is missing.
 */
export function getByPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (node == null) return undefined;
    if (Array.isArray(node)) return node[Number(segment)];
    if (typeof node === "object") {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, root);
}
