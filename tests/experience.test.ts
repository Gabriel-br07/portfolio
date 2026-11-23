import { describe, expect, it } from 'vitest'
import { accentStyle, adjacentExperiences, experienceStem } from '../app/utils/experience'

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
