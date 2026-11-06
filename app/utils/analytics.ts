const GA_ID_PATTERN = /^G-[A-Z0-9]+$/

/** Returns the trimmed GA4 measurement ID, or '' when missing or malformed. */
export function resolveGaMeasurementId(raw: unknown): string {
  const id = typeof raw === 'string' ? raw.trim() : ''
  return GA_ID_PATTERN.test(id) ? id : ''
}

export type ContactMethod = 'linkedin' | 'github' | 'email' | 'meeting'
export type ContactPlacement = 'hero' | 'footer' | 'contact_modal' | 'speaking' | 'projects'

/**
 * Custom GA4 events. Event and parameter names are snake_case and at most 40 characters,
 * parameter values at most 100 (GA4 collection limits). Never put personal data in here.
 */
export interface AnalyticsEvents {
  click_contact: { method: ContactMethod, placement: ContactPlacement }
  generate_lead: { method: 'contact_form' }
  click_project: { project: string, placement: 'card' | 'link' }
  open_book_modal: { book: string }
  click_book_buy: { book: string }
  change_language: { language_from: string, language_to: string, placement: 'header' | 'footer' }
  toggle_theme: { theme: 'light' | 'dark' }
  toggle_mascots: { active: boolean }
}

const GA_PARAM_VALUE_MAX = 100

/** Maps a link to the contact channel it represents, or null when it is not a contact link. */
export function classifyContactLink(url: unknown, meetingUrl?: string): ContactMethod | null {
  if (typeof url !== 'string') return null
  const value = url.trim()
  if (/^mailto:/i.test(value)) return 'email'
  if (meetingUrl && value === meetingUrl) return 'meeting'

  let host: string
  try {
    host = new URL(value).hostname.toLowerCase()
  } catch {
    return null
  }
  const isHost = (domain: string) => host === domain || host.endsWith(`.${domain}`)
  if (isHost('linkedin.com')) return 'linkedin'
  if (isHost('github.com')) return 'github'
  return null
}

type ParamValue = string | number | boolean | null | undefined

/** Drops empty values and trims strings to the GA4 parameter value limit. */
export function sanitizeParams(params: Record<string, ParamValue>): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    result[key] = typeof value === 'string' ? value.slice(0, GA_PARAM_VALUE_MAX) : value
  }
  return result
}
