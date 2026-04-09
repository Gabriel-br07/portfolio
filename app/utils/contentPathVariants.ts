/**
 * Paths stored by Nuxt Content may use `/locale` or `/locale/`; Vue Router may differ.
 * Tries all variants so queryCollection(...).path(p) matches the indexed document.
 */
export function contentPathVariants(...candidates: string[]): string[] {
  const out = new Set<string>()
  for (const raw of candidates) {
    if (!raw) continue
    out.add(raw)
    const trimmed = raw.replace(/\/+$/, '') || '/'
    out.add(trimmed)
    if (trimmed !== '/') {
      out.add(`${trimmed}/`)
    }
  }
  return [...out]
}
