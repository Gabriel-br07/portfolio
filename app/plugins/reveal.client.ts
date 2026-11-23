// Scroll reveal ("spring"): elements marked with `data-reveal` pop in when they enter the viewport.
//
// - The server HTML is untouched, so without JS (and for crawlers) everything is visible.
// - After mount, only elements that start BELOW the fold are hidden (data-reveal-state="hidden"), then revealed
//   once by an IntersectionObserver (data-reveal-state="in"). Elements already in view are never touched, so the
//   hero/LCP and the first screen do not change. Hydration is not affected: it only sets a data attribute.
// - The animation is CSS (transform/opacity, see main.css); it is off under prefers-reduced-motion.
// - Elements entering in the same frame cascade with a small delay (`revealDelay`).
// - The logic lives in `createRevealer` (app/utils/reveal.ts, unit tested); this file only wires it to the DOM.
const adapters = new WeakMap<HTMLElement, RevealEl & { node: HTMLElement }>()

function adapt(node: HTMLElement) {
  let adapter = adapters.get(node)
  if (!adapter) {
    adapter = {
      node,
      rect: () => node.getBoundingClientRect(),
      contains: target => target instanceof Node && node.contains(target),
      setState: (state) => {
        node.dataset.revealState = state
      },
      setDelay: (ms) => {
        if (ms === null) node.style.removeProperty('--reveal-delay')
        else node.style.setProperty('--reveal-delay', `${ms}ms`)
      },
      onTransformEnd: (cb) => {
        node.addEventListener('transitionend', function onEnd(event) {
          if (event.target !== node || event.propertyName !== 'transform') return
          node.removeEventListener('transitionend', onEnd)
          cb()
        })
      }
    }
    adapters.set(node, adapter)
  }
  return adapter
}

export default defineNuxtPlugin((nuxtApp) => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const revealer = createRevealer({
    prefersReducedMotion: () => reduceMotion.matches,
    createObserver: (onIntersect) => {
      const observer = new IntersectionObserver(
        entries => onIntersect(entries.map(entry => ({
          target: adapt(entry.target as HTMLElement),
          isIntersecting: entry.isIntersecting,
          rect: entry.boundingClientRect
        }))),
        { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
      )
      return {
        observe: el => observer.observe(el.node),
        unobserve: el => observer.unobserve(el.node),
        disconnect: () => observer.disconnect()
      }
    },
    pending: () => [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-state])')].map(adapt),
    viewportHeight: () => window.innerHeight,
    hashTarget: () => {
      const id = hashTargetId(location.hash)
      return id ? document.getElementById(id) : null
    },
    setTimer: (fn, ms) => window.setTimeout(fn, ms),
    clearTimer: id => window.clearTimeout(id)
  })

  nuxtApp.hook('app:mounted', revealer.scan)
  // Client-side navigation renders a new page after the plugin ran: drop the old elements, scan the new ones.
  nuxtApp.hook('page:start', revealer.reset)
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(revealer.scan)
  })
})
