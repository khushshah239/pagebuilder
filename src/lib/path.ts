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
/**
 * Example — getByPath(data, "related_article.results.0.title")
 *
 * path.split(".") -> ["related_article", "results", "0", "title"]
 *
 * data = {
 *   related_article: {
 *     results: [
 *       { title: "Article A", ... },
 *       { title: "Article B", ... },
 *     ]
 *   }
 * }
 *
 * reduce walks one segment at a time, narrowing "node" further each step:
 *
 *   step 1: segment "related_article", node = data (object)
 *           -> node["related_article"]  =>  { results: [...] }
 *
 *   step 2: segment "results", node = { results: [...] } (object)
 *           -> node["results"]  =>  [ {title:"Article A"}, {title:"Article B"} ]
 *
 *   step 3: segment "0", node = the array
 *           -> Array.isArray(node) is true, so node[Number("0")]
 *           => { title: "Article A" }
 *
 *   step 4: segment "title", node = { title: "Article A" } (object)
 *           -> node["title"]  =>  "Article A"
 *
 * Final result: "Article A"
 *
 * If any step's segment doesn't exist (e.g. index 5 on a 2-item array,
 * or a typo'd field name), that step returns undefined, and the
 * `node == null` check at the top short-circuits every remaining step
 * to undefined too — instead of throwing "Cannot read property of undefined".
 *
 * .trim() guards against hand-authored CMS binding sources with stray
 * spaces, e.g. "related_article. results.0.title" (space after the dot)
 * would otherwise look for a key literally named " results" and silently
 * fail to match "results".
 */