/**
 * JSON for an `application/ld+json` script. `<` is escaped (`\u003c`) so a `</script>` or `<!--` inside any string
 * (content is editable YAML) cannot end the tag or open an HTML comment; JSON parsers read it back unchanged.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
