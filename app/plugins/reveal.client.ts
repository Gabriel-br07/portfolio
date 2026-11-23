// Scroll reveal ("spring"): elements marked with `data-reveal` pop in when they enter the viewport.
//
// - The server HTML is untouched, so without JS (and for crawlers) everything is visible.
// - After mount, only elements that start BELOW the fold are hidden (data-reveal-state="hidden"), then revealed
//   once by an IntersectionObserver (data-reveal-state="in"). Elements already in view are never touched, so the
//   hero/LCP and the first screen do not change. Hydration is not affected: it only sets a data attribute.
// - The animation is CSS (transform/opacity, see main.css); it is off under prefers-reduced-motion.
// - Elements entering in the same frame cascade with a small delay (`revealDelay`).
export default defineNuxtPlugin((nuxtApp) => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let observer: IntersectionObserver | undefined

  const timers = new WeakMap<HTMLElement, number>()

  function finish(el: HTMLElement) {
    window.clearTimeout(timers.get(el))
    el.dataset.revealState = 'done' // drops the reveal styles, so hover/focus transitions of the element are untouched
    el.style.removeProperty('--reveal-delay')
  }

  function show(el: HTMLElement, index: number) {
    el.style.setProperty('--reveal-delay', `${revealDelay(index)}ms`)
    el.dataset.revealState = 'in'
    el.addEventListener('transitionend', function onEnd(event) {
      if (event.target !== el || event.propertyName !== 'transform') return
      el.removeEventListener('transitionend', onEnd)
      finish(el)
    })
    timers.set(el, window.setTimeout(() => finish(el), 1800)) // safety net when transitionend never fires
  }

  function onIntersect(entries: IntersectionObserverEntry[]) {
    entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach((entry, index) => {
        observer?.unobserve(entry.target)
        show(entry.target as HTMLElement, index)
      })
  }

  function scan() {
    if (reduceMotion.matches) return
    observer ??= new IntersectionObserver(onIntersect, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' })
    // Deep link (`#theme-2`): the target block must not pop in after the browser scrolled to it.
    const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
    document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-state])').forEach((el) => {
      if (target && el.contains(target)) return
      if (!needsReveal(el.getBoundingClientRect(), window.innerHeight)) return
      el.dataset.revealState = 'hidden'
      observer!.observe(el)
    })
  }

  nuxtApp.hook('app:mounted', scan)
  // Client-side navigation renders a new page after the plugin ran.
  // Drop the previous page's elements from the observer; `scan` recreates it.
  nuxtApp.hook('page:start', () => {
    observer?.disconnect()
    observer = undefined
  })
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(scan)
  })
})
