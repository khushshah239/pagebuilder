// Resolves a dotted path against a nested object; numeric segments index into arrays.
export function getByPath(root: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, rawSegment) => {
    if (node == null) return undefined;
    // Trim stray whitespace from hand-authored CMS binding sources.
    const segment = rawSegment.trim();
    if (Array.isArray(node)) return node[Number(segment)];
    if (typeof node === "object") {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, root);
}
