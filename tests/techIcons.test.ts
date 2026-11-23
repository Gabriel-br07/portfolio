import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TECH_ICONS, techIcon } from '../app/utils/techIcons'

const INDEXES = ['content/index.yml', 'content/pt/index.yml', 'content/es/index.yml']

/** Technologies listed in `stack: [...]` of the experience block, across the three locales. */
function stackTechnologies(): string[] {
  return INDEXES.flatMap((path) => {
    const text = readFileSync(join(process.cwd(), path), 'utf8')
    return [...text.matchAll(/^ {6}stack: \[(.*)\]$/gm)].flatMap(m =>
      m[1]!.split(',').map(item => item.trim().replace(/^"|"$/g, '')).filter(Boolean)
    )
  })
}

describe('techIcons', () => {
  it('has an icon for every technology used in a stack', () => {
    const missing = [...new Set(stackTechnologies())].filter(tech => !techIcon(tech))
    expect(missing, `add these to app/utils/techIcons.ts: ${missing.join(', ')}`).toEqual([])
  })

  it('only holds well-formed SVG path data', () => {
    for (const [tech, icon] of Object.entries(TECH_ICONS)) {
      expect(icon.paths.length, tech).toBeGreaterThan(0)
      for (const d of icon.paths) expect(d, tech).toMatch(/^[Mm][\d\s.,a-zA-Z-]+$/)
    }
  })

  it('returns undefined for an unknown technology', () => {
    expect(techIcon('NotATech')).toBeUndefined()
  })
})
