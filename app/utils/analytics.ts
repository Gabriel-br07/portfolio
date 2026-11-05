const GA_ID_PATTERN = /^G-[A-Z0-9]+$/

/** Returns the trimmed GA4 measurement ID, or '' when missing or malformed. */
export function resolveGaMeasurementId(raw: unknown): string {
  const id = typeof raw === 'string' ? raw.trim() : ''
  return GA_ID_PATTERN.test(id) ? id : ''
}
