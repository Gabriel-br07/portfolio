// Google tag (gtag.js): client-only and production only, loaded on idle so it stays off the
// hydration window. Nothing is added to the prerendered HTML.
export default defineNuxtPlugin(() => {
  const { public: { gaMeasurementId } } = useRuntimeConfig()
  const id = typeof gaMeasurementId === 'string' ? gaMeasurementId.trim() : ''

  // The ID is interpolated into a script URL, so reject anything that is not a GA4 ID.
  if (import.meta.dev || !/^G-[A-Z0-9]+$/.test(id)) return

  const win = window as unknown as {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }

  function load() {
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

  onNuxtReady(() => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(load)
    else setTimeout(load, 2000)
  })
})
