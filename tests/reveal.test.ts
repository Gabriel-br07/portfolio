import { describe, expect, it } from 'vitest'
import { needsReveal, revealDelay } from '../app/utils/reveal'

describe('revealDelay', () => {
  it('has no delay for the first element of a batch', () => {
    expect(revealDelay(0)).toBe(0)
  })

  it('adds one step per element', () => {
    expect(revealDelay(1)).toBe(90)
    expect(revealDelay(3)).toBe(270)
  })

  it('caps the delay so a long batch never lags', () => {
    expect(revealDelay(50)).toBe(450)
  })

  it('accepts a custom step and cap', () => {
    expect(revealDelay(2, 100, 150)).toBe(150)
    expect(revealDelay(1, 100, 150)).toBe(100)
  })

  it('never returns a negative delay', () => {
    expect(revealDelay(-3)).toBe(0)
  })
})

describe('needsReveal', () => {
  it('reveals elements that start below the visible area', () => {
    expect(needsReveal({ top: 900 }, 800)).toBe(true)
  })

  it('leaves elements that are already (even partly) in view alone', () => {
    expect(needsReveal({ top: 400 }, 800)).toBe(false)
    expect(needsReveal({ top: 799 }, 800)).toBe(false)
  })

  it('leaves elements above the viewport alone', () => {
    expect(needsReveal({ top: -300 }, 800)).toBe(false)
  })

  it('treats an element exactly at the bottom edge as below the fold', () => {
    expect(needsReveal({ top: 800 }, 800)).toBe(true)
  })
})
