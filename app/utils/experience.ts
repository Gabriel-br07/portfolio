import type { ExperienceCase, ExperienceCaseDetail, ExperienceItem } from '~/types/experience'

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

/**
 * Joins the long detail (`experiences` collection) with the short item (`index.experience.items`) of the same role.
 * Null when either side is missing, so the page answers 404 instead of rendering half a case study.
 */
export function buildExperienceCase(
  detail: ExperienceCaseDetail | null | undefined,
  items: readonly ExperienceItem[],
  slug: string
): ExperienceCase | null {
  const item = items.find(i => i.slug === slug)
  if (!detail || !item) return null
  return { item, detail, ...adjacentExperiences(items, slug) }
}

export type SheetState = 'loading' | 'error' | 'ready'

/** What the mobile sheet shows for an async-data status: skeleton, retry message or the case study. */
export function sheetState(status: string, hasData: boolean): SheetState {
  if (status === 'idle' || status === 'pending') return 'loading'
  return hasData ? 'ready' : 'error'
}

/** Overall reading progress of the page in [0, 1] (0 when the page does not scroll). */
export function scrollOverall(scrollY: number, scrollHeight: number, innerHeight: number): number {
  const max = scrollHeight - innerHeight
  return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
}
