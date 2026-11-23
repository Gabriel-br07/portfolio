import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../app/utils/color'

describe('contrastRatio', () => {
  it('is 21 between black and white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('is 1 for identical colors', () => {
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#0e7490', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#0e7490'), 10)
  })

  it('accepts short and upper-case hex', () => {
    expect(contrastRatio('#FFF', '#000')).toBeCloseTo(21, 5)
  })

  it('matches a known WCAG value (#0e7490 on white is about 5.4)', () => {
    expect(contrastRatio('#0e7490', '#ffffff')).toBeGreaterThan(5.3)
    expect(contrastRatio('#0e7490', '#ffffff')).toBeLessThan(5.5)
  })

  it('returns NaN for an invalid color', () => {
    expect(Number.isNaN(contrastRatio('not-a-color', '#ffffff'))).toBe(true)
  })
})
