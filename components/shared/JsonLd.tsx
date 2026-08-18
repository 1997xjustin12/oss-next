type Props = {
  data: object | object[]
}

/**
 * Escape the three sequences that can terminate or reopen a <script> block
 * from inside a JSON string literal.
 *
 * `JSON.stringify` does not escape `<`, so any value containing `</script>`
 * closes this element early and the remainder of the JSON lands in the document
 * as markup. That was already reachable through a product title; it became far
 * more likely once WP-recovered structured data started flowing through here
 * (services/wp-pages.service.ts). The escapes are valid JSON, so consumers
 * parse the identical object.
 */
function safeJson(data: object | object[]): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson(data) }}
    />
  )
}
