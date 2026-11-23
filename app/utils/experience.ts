interface WithSlug {
  slug: string
}

/** Neighbours of `slug` in a list sorted newest first. Unknown slug → no neighbours. */
export function adjacentExperiences<T extends WithSlug>(
  items: readonly T[],
  slug: string
): { newer: T | null, older: T | null } {
  const index = items.findIndex(item => item.slug === slug)
  if (index === -1) return { newer: null, older: null }
  return { newer: items[index - 1] ?? null, older: items[index + 1] ?? null }
}

/**
 * Content stem of a case study: `experience/oby` (default locale), `pt/experience/oby`, `es/experience/oby`.
 * Built from the locale code because `localePath('/experience')` cannot resolve the prefix: only the
 * dynamic route `/experience/:slug` exists, not `/experience` itself.
 */
export function experienceStem(locale: string, defaultLocale: string, slug: string): string {
  return `${locale === defaultLocale ? '' : `${locale}/`}experience/${slug}`
}

/** Inline CSS variables that scope the company accent color (light and dark theme) to an element. */
export function accentStyle(company?: { color?: string, colorDark?: string }): Record<string, string> {
  const style: Record<string, string> = {}
  if (company?.color) style['--exp-accent-light'] = company.color
  if (company?.colorDark) style['--exp-accent-dark'] = company.colorDark
  return style
}
