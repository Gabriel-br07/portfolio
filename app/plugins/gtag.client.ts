// Google tag (gtag.js): client-only, production only, and only after the visitor accepts
// the consent banner. Nothing is added to the prerendered HTML.
export default defineNuxtPlugin(() => {
  const { public: { gaMeasurementId } } = useRuntimeConfig()
  const id = typeof gaMeasurementId === 'string' ? gaMeasurementId.trim() : ''

  // The ID is interpolated into a script URL, so reject anything that is not a GA4 ID.
  if (import.meta.dev || !/^G-[A-Z0-9]+$/.test(id)) return

  const { consent } = useAnalyticsConsent()
  const disableKey = `ga-disable-${id}`
  const win = window as unknown as Record<string, unknown> & {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
  let loaded = false

  function load() {
    if (loaded) return
    loaded = true
    win.dataLayer = win.dataLayer || []
    // gtag.js only understands the `arguments` object, not a rest-parameter array.
    win.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      win.dataLayer.push(arguments)
    }
    win.gtag('js', new Date())
    win.gtag('config', id)

    const script = document.createElement('script')
    script.id = 'gtag-js'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.appendChild(script)
  }

  // Keeps the tag off the hydration window for returning, already-consented visitors.
  function loadWhenIdle() {
    onNuxtReady(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(load)
      else setTimeout(load, 2000)
    })
  }

  watch(consent, (value) => {
    win[disableKey] = value !== 'granted'
    if (value === 'granted') loadWhenIdle()
  }, { immediate: true })
})
