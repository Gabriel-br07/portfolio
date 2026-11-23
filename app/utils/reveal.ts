/** Delay (ms) for the nth element revealed in the same frame, capped so a long batch never lags. */
export function revealDelay(index: number, step = 90, max = 450): number {
  return Math.min(Math.max(index, 0) * step, max)
}

/**
 * Whether an element still has to be revealed: only the ones that start below the visible area.
 * What is already in view (or above it, e.g. after a scroll restore) is never hidden, so nothing flashes.
 */
export function needsReveal(rect: { top: number }, viewportHeight: number): boolean {
  return rect.top >= viewportHeight
}

/**
 * Element id of a location hash (`#theme-2` -> `theme-2`), or null when there is none or it is malformed.
 * `decodeURIComponent` throws a URIError on input such as `#%E0`; that must never abort the reveal scan.
 */
export function hashTargetId(hash: string): string | null {
  if (hash.length <= 1) return null
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return null
  }
}

/** DOM-free view of an element marked with `data-reveal`; the plugin adapts real elements to it. */
export interface RevealEl {
  rect(): { top: number, left: number }
  contains(target: unknown): boolean
  setState(state: 'hidden' | 'in' | 'done'): void
  setDelay(ms: number | null): void
  /** Calls `cb` once, when the element's `transform` transition ends. */
  onTransformEnd(cb: () => void): void
}

export interface RevealEntry<T extends RevealEl> {
  target: T
  isIntersecting: boolean
  rect: { top: number, left: number }
}

export interface RevealObserver<T extends RevealEl> {
  observe(el: T): void
  unobserve(el: T): void
  disconnect(): void
}

export interface RevealDeps<T extends RevealEl> {
  prefersReducedMotion(): boolean
  createObserver(onIntersect: (entries: RevealEntry<T>[]) => void): RevealObserver<T>
  /** Elements with `data-reveal` that have no state yet. */
  pending(): T[]
  viewportHeight(): number
  /** Element the URL hash points at (deep link), if any. */
  hashTarget(): unknown
  setTimer(fn: () => void, ms: number): number
  clearTimer(id: number): void
}

/** Safety net for the "done" state when `transitionend` never fires (e.g. the element is detached). */
export const REVEAL_SAFETY_MS = 1800

/**
 * Scroll-reveal state machine (hidden -> in -> done), free of DOM globals so it can be unit tested.
 * Elements that start below the fold are hidden and revealed once, in a cascade, when they intersect.
 */
export function createRevealer<T extends RevealEl>(deps: RevealDeps<T>) {
  let observer: RevealObserver<T> | undefined
  const timers = new Map<T, number>()

  function finish(el: T) {
    const timer = timers.get(el)
    if (timer !== undefined) deps.clearTimer(timer)
    timers.delete(el)
    el.setState('done') // drops the reveal styles, so hover/focus transitions of the element are untouched
    el.setDelay(null)
  }

  function show(el: T, index: number) {
    el.setDelay(revealDelay(index))
    el.setState('in')
    el.onTransformEnd(() => finish(el))
    timers.set(el, deps.setTimer(() => finish(el), REVEAL_SAFETY_MS))
  }

  function onIntersect(entries: RevealEntry<T>[]) {
    entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)
      .forEach((entry, index) => {
        observer?.unobserve(entry.target)
        show(entry.target, index)
      })
  }

  function scan() {
    if (deps.prefersReducedMotion()) return
    observer ??= deps.createObserver(onIntersect)
    const target = deps.hashTarget()
    for (const el of deps.pending()) {
      if (target && el.contains(target)) continue // a deep link target must not pop in after the browser scrolled to it
      if (!needsReveal(el.rect(), deps.viewportHeight())) continue
      el.setState('hidden')
      observer.observe(el)
    }
  }

  /** Forget the observed elements (page change); `scan` creates a new observer. */
  function reset() {
    observer?.disconnect()
    observer = undefined
  }

  return { scan, reset }
}
