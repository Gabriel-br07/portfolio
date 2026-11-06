import { describe, expect, it } from 'vitest'
import { classifyContactLink, sanitizeParams } from '../app/utils/analytics'

describe('classifyContactLink', () => {
  it.each([
    ['https://www.linkedin.com/in/someone', 'linkedin'],
    ['https://linkedin.com/in/someone', 'linkedin'],
    ['https://github.com/someone', 'github'],
    ['https://www.github.com/someone', 'github'],
    ['mailto:someone@example.com', 'email'],
    ['MAILTO:someone@example.com', 'email']
  ])('classifies %s as %s', (url, expected) => {
    expect(classifyContactLink(url)).toBe(expected)
  })

  it('classifies the configured meeting link', () => {
    expect(classifyContactLink('https://cal.example.com/me', 'https://cal.example.com/me')).toBe('meeting')
  })

  it.each([
    'https://example.com',
    'https://notlinkedin.com/in/someone',
    'https://github.com.evil.test/x',
    '/projects',
    '',
    'not a url'
  ])('returns null for %j', (url) => {
    expect(classifyContactLink(url)).toBeNull()
  })

  it.each([undefined, null, 42, {}])('returns null for non-string %j', (value) => {
    expect(classifyContactLink(value)).toBeNull()
  })
})

describe('sanitizeParams', () => {
  it('trims strings to the 100 character GA4 limit', () => {
    const result = sanitizeParams({ project: 'a'.repeat(150) })
    expect(result.project).toHaveLength(100)
  })

  it('drops undefined and null values', () => {
    expect(sanitizeParams({ a: undefined, b: null, c: 'x' })).toEqual({ c: 'x' })
  })

  it('keeps booleans and numbers untouched', () => {
    expect(sanitizeParams({ active: false, count: 0 })).toEqual({ active: false, count: 0 })
  })
})
