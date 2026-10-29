export type AnalyticsConsent = 'granted' | 'denied'

export function useAnalyticsConsent() {
  const consent = useCookie<AnalyticsConsent | null>('analytics-consent', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 180,
    sameSite: 'lax',
    path: '/'
  })

  const accept = () => {
    consent.value = 'granted'
  }
  const decline = () => {
    consent.value = 'denied'
  }
  // Clears the stored choice so the banner is shown again.
  const revoke = () => {
    consent.value = null
  }

  return { consent, accept, decline, revoke }
}
