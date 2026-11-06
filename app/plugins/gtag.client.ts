// Google tag (gtag.js): client-only, production only, and only after the visitor accepts
// the consent banner. Nothing is added to the prerendered HTML.
export default defineNuxtPlugin(() => {
  const { public: { gaMeasurementId } } = useRuntimeConfig()
  const id = resolveGaMeasurementId(gaMeasurementId)

  // The ID is interpolated into a script URL, so anything that is not a GA4 ID resolves to ''.
  if (import.meta.dev || !id) return

  const { consent } = useAnalyticsConsent()
  const disableKey = `ga-disable-${id}`
  let initialized = false
  let scriptAdded = false

  // Creates the dataLayer and the gtag stub right away so events fired before the script
  // finishes loading are queued (gtag.js replays the queue in order).
  function init() {
    if (initialized) return
    initialized = true
    window.dataLayer = window.dataLayer || []
    // gtag.js only understands the `arguments` object, not a rest-parameter array.
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', id)
  }

  function addScript() {
    if (scriptAdded) return
    scriptAdded = true
    const script = document.createElement('script')
    script.id = 'gtag-js'
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.appendChild(script)
  }

  // Keeps the tag off the hydration window for returning, already-consented visitors.
  function addScriptWhenIdle() {
    onNuxtReady(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(addScript)
      else setTimeout(addScript, 2000)
    })
  }

  watch(consent, (value) => {
    (window as unknown as Record<string, unknown>)[disableKey] = value !== 'granted'
    if (value === 'granted') {
      init()
      addScriptWhenIdle()
    }
  }, { immediate: true })
})
