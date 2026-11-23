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
