import { describe, expect, it } from 'vitest'
import {
  REVEAL_SAFETY_MS,
  createRevealer,
  hashTargetId,
  needsReveal,
  revealDelay,
  type RevealEl,
  type RevealEntry,
  type RevealObserver
} from '../app/utils/reveal'

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

describe('hashTargetId', () => {
  it('returns the id without the leading #', () => {
    expect(hashTargetId('#theme-2')).toBe('theme-2')
  })

  it('decodes percent-encoded ids', () => {
    expect(hashTargetId('#se%C3%A7%C3%A3o')).toBe('seção')
  })

  it('returns null for an empty hash or a lone #', () => {
    expect(hashTargetId('')).toBeNull()
    expect(hashTargetId('#')).toBeNull()
  })

  it('returns null instead of throwing on a malformed hash', () => {
    expect(() => hashTargetId('#%E0')).not.toThrow()
    expect(hashTargetId('#%E0')).toBeNull()
  })
})

class FakeEl implements RevealEl {
  state: string | undefined
  delay: number | null | undefined
  endCallbacks: (() => void)[] = []
  constructor(public top: number, public left = 0, public inside: unknown[] = []) {}
  rect() { return { top: this.top, left: this.left } }
  contains(target: unknown) { return this.inside.includes(target) }
  setState(state: 'hidden' | 'in' | 'done') { this.state = state }
  setDelay(ms: number | null) { this.delay = ms }
  onTransformEnd(cb: () => void) { this.endCallbacks.push(cb) }
}

function setup(options: { reduced?: boolean, hashTarget?: unknown, elements: FakeEl[] }) {
  let onIntersect: (entries: RevealEntry<FakeEl>[]) => void = () => {}
  const observed = new Set<FakeEl>()
  let disconnects = 0
  let created = 0
  const timers = new Map<number, () => void>()
  let nextTimer = 1
  const observer: RevealObserver<FakeEl> = {
    observe: el => observed.add(el),
    unobserve: el => observed.delete(el),
    disconnect: () => {
      disconnects++
      observed.clear()
    }
  }
  const revealer = createRevealer<FakeEl>({
    prefersReducedMotion: () => !!options.reduced,
    createObserver: (cb) => {
      created++
      onIntersect = cb
      return observer
    },
    pending: () => options.elements.filter(el => el.state === undefined),
    viewportHeight: () => 800,
    hashTarget: () => options.hashTarget ?? null,
    setTimer: (fn) => {
      timers.set(nextTimer, fn)
      return nextTimer++
    },
    clearTimer: id => timers.delete(id)
  })
  return {
    revealer,
    observed,
    timers,
    emit: (entries: RevealEntry<FakeEl>[]) => onIntersect(entries),
    intersect: (...els: FakeEl[]) => onIntersect(els.map(target => ({ target, isIntersecting: true, rect: target.rect() }))),
    counts: () => ({ disconnects, created })
  }
}

describe('createRevealer', () => {
  it('hides only the elements below the fold and observes them', () => {
    const inView = new FakeEl(100)
    const below = new FakeEl(1200)
    const t = setup({ elements: [inView, below] })
    t.revealer.scan()
    expect(inView.state).toBeUndefined()
    expect(below.state).toBe('hidden')
    expect([...t.observed]).toEqual([below])
  })

  it('does nothing under prefers-reduced-motion', () => {
    const below = new FakeEl(1200)
    const t = setup({ reduced: true, elements: [below] })
    t.revealer.scan()
    expect(below.state).toBeUndefined()
    expect(t.counts().created).toBe(0)
  })

  it('leaves the element that contains the hash target visible', () => {
    const target = {}
    const deepLinked = new FakeEl(1200, 0, [target])
    const other = new FakeEl(1500)
    const t = setup({ hashTarget: target, elements: [deepLinked, other] })
    t.revealer.scan()
    expect(deepLinked.state).toBeUndefined()
    expect(other.state).toBe('hidden')
  })

  it('keeps elements hidden until they intersect (no timer reveals them early)', () => {
    const below = new FakeEl(1200)
    const t = setup({ elements: [below] })
    t.revealer.scan()
    expect(below.state).toBe('hidden')
    expect(t.timers.size).toBe(0)
  })

  it('reveals intersecting elements once, top-to-bottom, with a growing cascade delay', () => {
    const a = new FakeEl(1000, 0)
    const b = new FakeEl(1000, 300)
    const c = new FakeEl(1400, 0)
    const t = setup({ elements: [c, b, a] })
    t.revealer.scan()
    t.intersect(c, b, a)
    expect([a.state, b.state, c.state]).toEqual(['in', 'in', 'in'])
    expect([a.delay, b.delay, c.delay]).toEqual([0, 90, 180])
    expect(t.observed.size).toBe(0) // each element is unobserved after its reveal
  })

  it('ignores entries that are not intersecting', () => {
    const below = new FakeEl(1200)
    const t = setup({ elements: [below] })
    t.revealer.scan()
    t.emit([{ target: below, isIntersecting: false, rect: below.rect() }])
    expect(below.state).toBe('hidden')
    expect(t.observed.has(below)).toBe(true)
  })

  it('finishes on transitionend and clears the safety timer', () => {
    const below = new FakeEl(1200)
    const t = setup({ elements: [below] })
    t.revealer.scan()
    t.intersect(below)
    expect(t.timers.size).toBe(1)
    below.endCallbacks[0]!()
    expect(below.state).toBe('done')
    expect(below.delay).toBeNull()
    expect(t.timers.size).toBe(0)
  })

  it('finishes through the safety timer when transitionend never fires', () => {
    const below = new FakeEl(1200)
    const t = setup({ elements: [below] })
    t.revealer.scan()
    t.intersect(below)
    expect(REVEAL_SAFETY_MS).toBe(1800)
    ;[...t.timers.values()][0]!()
    expect(below.state).toBe('done')
  })

  it('reset disconnects the observer and scan creates a new one', () => {
    const below = new FakeEl(1200)
    const t = setup({ elements: [below] })
    t.revealer.scan()
    t.revealer.reset()
    expect(t.counts().disconnects).toBe(1)
    t.revealer.scan()
    expect(t.counts().created).toBe(2)
  })
})
