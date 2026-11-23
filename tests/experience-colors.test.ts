import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../app/utils/color'

/**
 * Company accent colors (`company.color` for the light theme, `company.colorDark` for the dark one) must be
 * readable as text/icon color on the real Nuxt UI surfaces: `--ui-bg` and `--ui-bg-elevated`
 * (white / neutral-100 in light, neutral-900 / neutral-800 in dark).
 */
const INDEXES = ['content/index.yml', 'content/pt/index.yml', 'content/es/index.yml']
const LIGHT_SURFACES = ['#ffffff', '#f5f5f5']
const DARK_SURFACES = ['#171717', '#262626']
const MIN_CONTRAST = 4.5

interface Colors { name: string, color?: string, colorDark?: string }

function readColors(path: string): Colors[] {
  const block = readFileSync(join(process.cwd(), path), 'utf8').split(/^experience:/m)[1] ?? ''
  return block.split(/^ {4}- slug:/m).slice(1).map((item) => {
    const get = (key: string) => item.match(new RegExp(`^ {8}${key}: "([^"]*)"$`, 'm'))?.[1]
    return { name: get('name') ?? '', color: get('color'), colorDark: get('colorDark') }
  })
}

describe('experience accent colors', () => {
  const all = INDEXES.map(path => ({ path, items: readColors(path) }))

  it('defines a light and a dark color for every company, as #RRGGBB', () => {
    for (const { path, items } of all) {
      expect(items.length, path).toBeGreaterThan(0)
      for (const item of items) {
        expect(item.color, `${path} ${item.name} color`).toMatch(/^#[0-9a-f]{6}$/i)
        expect(item.colorDark, `${path} ${item.name} colorDark`).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('uses the same colors in every locale', () => {
    const [en, ...others] = all
    for (const other of others) expect(other!.items, other!.path).toEqual(en!.items)
  })

  it.each(LIGHT_SURFACES)('light color has at least 4.5:1 on %s', (surface) => {
    for (const item of all[0]!.items) {
      expect(contrastRatio(item.color!, surface), `${item.name} ${item.color}`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })

  it.each(DARK_SURFACES)('dark color has at least 4.5:1 on %s', (surface) => {
    for (const item of all[0]!.items) {
      expect(contrastRatio(item.colorDark!, surface), `${item.name} ${item.colorDark}`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })
})
