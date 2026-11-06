/**
 * Sends custom GA4 events. A no-op on the server, in dev, without consent, or while the
 * gtag stub does not exist yet (the plugin only creates it after the visitor accepts).
 */
export function useAnalytics() {
  const { consent } = useAnalyticsConsent()
  const { global } = useAppConfig()

  function track<K extends keyof AnalyticsEvents>(name: K, params: AnalyticsEvents[K]) {
    if (!import.meta.client || import.meta.dev) return
    if (consent.value !== 'granted' || typeof window.gtag !== 'function') return
    window.gtag('event', name, sanitizeParams(params))
  }

  /** Tracks a click on a contact link; links that are not contact channels are ignored. */
  function trackContactLink(url: unknown, placement: ContactPlacement) {
    const method = classifyContactLink(url, global.meetingLink)
    if (method) track('click_contact', { method, placement })
  }

  return { track, trackContactLink }
}
