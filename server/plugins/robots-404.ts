// Error pages must never be indexed. The Nuxt error renderer sets `noindex` for HTML requests, but
// Nitro's JSON 404 (requests with `Accept: star/star`, e.g. curl or some crawlers) bypasses it and
// keeps the `index` header that @nuxtjs/robots sets at the start of the request.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, context) => {
    const event = context?.event
    if (event && (error as { statusCode?: number }).statusCode === 404) {
      setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
    }
  })
})
