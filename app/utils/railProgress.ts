export interface RailState {
  /** Index of the section being read (always the last one when the page is scrolled to the end). */
  active: number
  /** One value in [0, 1] per gap between two consecutive sections (length = sections - 1). */
  segments: number[]
}

/**
 * Reading progress of a list of sections, for the case-study side rail.
 *
 * @param tops document-relative top (px) of each section, ascending
 * @param probe reading position (px): scrollY plus a fraction of the viewport height
 * @param atBottom true when the page cannot scroll further
 */
export function railProgress(tops: readonly number[], probe: number, atBottom: boolean): RailState {
  if (tops.length === 0) return { active: 0, segments: [] }

  let active = 0
  tops.forEach((top, i) => {
    if (probe >= top) active = i
  })
  // The last heading may never cross the probe line when the page ends first.
  if (atBottom) active = tops.length - 1

  const segments = tops.slice(0, -1).map((top, i) => {
    if (atBottom) return 1
    const next = tops[i + 1]!
    const span = next - top
    if (span <= 0) return probe >= next ? 1 : 0
    return Math.min(1, Math.max(0, (probe - top) / span))
  })

  return { active, segments }
}
