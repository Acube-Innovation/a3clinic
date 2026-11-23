/**
 * Renders a JSON-LD graph. Server component — never ships JS.
 * Pass one schema object or an array; arrays are emitted as an @graph.
 */
export function JsonLd({ schema }: { schema: object | object[] }) {
  const payload = Array.isArray(schema)
    ? { "@context": "https://schema.org", "@graph": schema.map(stripContext) }
    : schema;

  return (
    <script
      type="application/ld+json"
      // Schema objects are authored in-repo, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

/** Nested @graph nodes must not repeat @context — only the root carries it. */
function stripContext(node: object) {
  const rest: Record<string, unknown> = { ...(node as Record<string, unknown>) };
  delete rest["@context"];
  return rest;
}
