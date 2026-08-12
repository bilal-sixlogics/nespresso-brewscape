/**
 * Renders a schema.org JSON-LD block.
 *
 * Server component by design — the payload must be present in the initial HTML.
 * AI crawlers (GPTBot, PerplexityBot, CCBot) largely do not execute JavaScript,
 * so structured data injected on the client is invisible to them.
 *
 * Renders no visible output.
 */

// `</script>` appearing inside a string value would otherwise close the tag
// early and allow markup injection. Escaping `<` blocks that; the sequence
// stays valid JSON and parsers decode it back to the original character.
function serialize(schema: unknown): string {
    return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export function JsonLd({ schema }: { schema: unknown | unknown[] }) {
    const blocks = Array.isArray(schema) ? schema : [schema];

    return (
        <>
            {blocks.filter(Boolean).map((block, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serialize(block) }}
                />
            ))}
        </>
    );
}
