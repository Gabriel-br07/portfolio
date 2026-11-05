import { describe, expect, it } from 'vitest'
import { resolveGaMeasurementId } from '../app/utils/analytics'

describe('resolveGaMeasurementId', () => {
  it('returns a valid GA4 ID unchanged', () => {
    expect(resolveGaMeasurementId('G-ABC123')).toBe('G-ABC123')
  })

  it('trims surrounding whitespace', () => {
    expect(resolveGaMeasurementId('  G-ABC123  ')).toBe('G-ABC123')
  })

  it.each(['g-abc123', 'UA-1', 'G-', 'G-ABC 123', 'G-ABC123;', ''])(
    'rejects %j',
    (value) => {
      expect(resolveGaMeasurementId(value)).toBe('')
    }
  )

  it.each([undefined, null, 42, {}])('rejects non-string %j', (value) => {
    expect(resolveGaMeasurementId(value)).toBe('')
  })
})
