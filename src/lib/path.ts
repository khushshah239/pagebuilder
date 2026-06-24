/**
 * Resolve a dotted path (e.g. `hero_carousel.results.1.title` or
 * `featured_articles.0.title`) against a nested object. Numeric segments index
 * into arrays, so both wrapped (`slot.results.N`) and unwrapped (`slot.N`) data
 * shapes are supported. Returns `undefined` when any segment is missing.
 */
export function getByPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, rawSegment) => {
    if (node == null) return undefined;
    // Tolerate stray whitespace in hand-authored binding sources (e.g. a CMS
    // entry like `data.0.legacy_url `). For clean segments this is a no-op.
    const segment = rawSegment.trim();
    if (Array.isArray(node)) return node[Number(segment)];
    if (typeof node === "object") {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, root);
}
