import { describe, expect, it } from 'vitest'
import { accentStyle, adjacentExperiences, buildExperienceCase, experienceStem, scrollOverall, sheetState } from '../app/utils/experience'

const make = (slug: string) => ({ slug })

// Sorted newest first, like `experience.items` in content/index.yml.
const oby = make('oby')
const dwcorp = make('dwcorp')
const serpro = make('serpro')
const items = [oby, dwcorp, serpro]

describe('adjacentExperiences', () => {
  it('has no newer role for the first (most recent) item', () => {
    expect(adjacentExperiences(items, 'oby')).toEqual({ newer: null, older: dwcorp })
  })

  it('returns both neighbours for an item in the middle', () => {
    expect(adjacentExperiences(items, 'dwcorp')).toEqual({ newer: oby, older: serpro })
  })

  it('has no older role for the last item', () => {
    expect(adjacentExperiences(items, 'serpro')).toEqual({ newer: dwcorp, older: null })
  })

  it('returns no neighbours for an unknown slug', () => {
    expect(adjacentExperiences(items, 'nope')).toEqual({ newer: null, older: null })
  })

  it('returns no neighbours for an empty list', () => {
    expect(adjacentExperiences([], 'oby')).toEqual({ newer: null, older: null })
  })

  it('returns no neighbours when the only item is the requested one', () => {
    expect(adjacentExperiences([oby], 'oby')).toEqual({ newer: null, older: null })
  })

  it('does not mutate its input', () => {
    const input = [oby, dwcorp, serpro]
    const before = structuredClone(input)
    adjacentExperiences(input, 'dwcorp')
    expect(input).toEqual(before)
  })
})

describe('experienceStem', () => {
  it.each([
    ['en', 'en', 'oby', 'experience/oby'],
    ['pt', 'en', 'oby', 'pt/experience/oby'],
    ['es', 'en', 'dwcorp', 'es/experience/dwcorp']
  ])('%s (default %s) + %s -> %s', (locale, defaultLocale, slug, expected) => {
    expect(experienceStem(locale, defaultLocale, slug)).toBe(expected)
  })
})

describe('accentStyle', () => {
  it('returns no variables without a company', () => {
    expect(accentStyle(undefined)).toEqual({})
  })

  it('scopes the light and dark accent colors', () => {
    expect(accentStyle({ color: '#111111', colorDark: '#eeeeee' })).toEqual({
      '--exp-accent-light': '#111111',
      '--exp-accent-dark': '#eeeeee'
    })
  })

  it('omits a missing dark color', () => {
    expect(accentStyle({ color: '#111111' })).toEqual({ '--exp-accent-light': '#111111' })
  })
})

describe('buildExperienceCase', () => {
  const item = (slug: string) => ({ slug, date: '', position: '', summary: '', highlights: [], stack: [] })
  const detail = (slug: string) => ({ slug, title: `Title ${slug}`, description: 'd', themes: [] })
  const items = [item('oby'), item('dwcorp'), item('serpro')]

  it('joins the detail with the short item and its neighbours', () => {
    const result = buildExperienceCase(detail('dwcorp'), items, 'dwcorp')
    expect(result?.item.slug).toBe('dwcorp')
    expect(result?.detail.title).toBe('Title dwcorp')
    expect(result?.newer?.slug).toBe('oby')
    expect(result?.older?.slug).toBe('serpro')
  })

  it('has no newer neighbour for the first role and no older one for the last', () => {
    expect(buildExperienceCase(detail('oby'), items, 'oby')?.newer).toBeNull()
    expect(buildExperienceCase(detail('serpro'), items, 'serpro')?.older).toBeNull()
  })

  it('is null for an unknown slug (404)', () => {
    expect(buildExperienceCase(detail('nope'), items, 'nope')).toBeNull()
  })

  it('is null when the detail is missing, e.g. the role exists in one locale only', () => {
    expect(buildExperienceCase(null, items, 'oby')).toBeNull()
    expect(buildExperienceCase(undefined, items, 'oby')).toBeNull()
  })

  it('is null when the home has no items', () => {
    expect(buildExperienceCase(detail('oby'), [], 'oby')).toBeNull()
  })
})

describe('sheetState', () => {
  it('is loading while idle or pending', () => {
    expect(sheetState('idle', false)).toBe('loading')
    expect(sheetState('pending', false)).toBe('loading')
  })

  it('is ready when data arrived', () => {
    expect(sheetState('success', true)).toBe('ready')
  })

  it('is an error (retry) when it finished without data', () => {
    expect(sheetState('success', false)).toBe('error')
    expect(sheetState('error', false)).toBe('error')
  })
})

describe('scrollOverall', () => {
  it('is the scrolled fraction of the scrollable height', () => {
    expect(scrollOverall(500, 2000, 1000)).toBe(0.5)
  })

  it('is 0 when the page does not scroll', () => {
    expect(scrollOverall(0, 800, 1000)).toBe(0)
    expect(scrollOverall(0, 1000, 1000)).toBe(0)
  })

  it('is clamped to [0, 1] (overscroll)', () => {
    expect(scrollOverall(-50, 2000, 1000)).toBe(0)
    expect(scrollOverall(1500, 2000, 1000)).toBe(1)
  })
})
