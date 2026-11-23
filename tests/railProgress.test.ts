import { describe, expect, it } from 'vitest'
import { railProgress } from '../app/utils/railProgress'

const tops = [100, 300, 600]

describe('railProgress', () => {
  it('handles no sections', () => {
    expect(railProgress([], 100, false)).toEqual({ active: 0, segments: [] })
  })

  it('has no segments for a single section', () => {
    expect(railProgress([100], 500, false)).toEqual({ active: 0, segments: [] })
  })

  it('keeps everything empty before the first section', () => {
    expect(railProgress(tops, 50, false)).toEqual({ active: 0, segments: [0, 0] })
  })

  it('fills the segments proportionally between two sections', () => {
    expect(railProgress(tops, 450, false)).toEqual({ active: 1, segments: [1, 0.5] })
  })

  it('closes the previous segment exactly when a section top is reached', () => {
    expect(railProgress(tops, 300, false)).toEqual({ active: 1, segments: [1, 0] })
  })

  it('activates the last section and fills every segment at the end of the page', () => {
    // The reading position can stay above the last heading when the page cannot scroll further.
    expect(railProgress(tops, 120, true)).toEqual({ active: 2, segments: [1, 1] })
  })

  it('never produces NaN when sections share the same top', () => {
    const { segments } = railProgress([100, 100, 100], 100, false)
    expect(segments.every(Number.isFinite)).toBe(true)
  })

  it('does not mutate its input', () => {
    const input = [100, 300, 600]
    const before = structuredClone(input)
    railProgress(input, 450, false)
    expect(input).toEqual(before)
  })

  it('never returns NaN when sections are missing from the DOM (infinite tops)', () => {
    const inf = Number.POSITIVE_INFINITY
    const result = railProgress([100, inf, inf], 500, false)
    expect(result.segments.every(Number.isFinite)).toBe(true)
    expect(result.segments).toEqual([0, 0])
    expect(railProgress([inf, inf], 500, false).segments).toEqual([0])
  })
})
