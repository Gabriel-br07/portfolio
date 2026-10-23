<script setup lang="ts">
/**
 * Global decorative Clawd mascot layer. Rendered client-only (via `<ClientOnly>` in
 * app.vue) and teleported to <body> so its absolute, document-coordinate
 * overlay scrolls naturally with the page. pointer-events: none everywhere —
 * mascots can never block clicks, focus or text selection.
 *
 * Scenes are keyed by the locale-normalized route (en default, /pt, /es): home (one-time
 * greeter), books (reader), projects (exerciser), blog (waving greeter).
 * Existing page/components opt in via data attributes only:
 *   - `data-mascot-anchor="key"`: placement reference element
 *   - `data-mascot-trigger="key"`: hover/focus reaction source
 */
import MascotActor from './MascotActor.vue'
import type { MascotState } from '~/types/mascots'

/** Default Clawd viewBox aspect (height / width); scenes with other artwork override it. */
const ASPECT = 20 / 24

/** Fraction of the actor box where the feet/ground line sits (used to align with the anchor baseline). */
const BASELINE = 0.92

/** Smallest width an actor may shrink to when squeezed beside its anchor. */
const MIN_FIT_WIDTH = 64

/** Home greeter: fades in at its spot, waves with a bubble, then walks off to the right and fades. */
const GREET = {
  waveS: 1.8,
  byeS: 1.5,
  fadeAtS: 0.9,
  exitDx: 360,
  sessionKey: 'mascot-greeted'
}

type Strategy = 'right-of' | 'below-center'

interface ActorSpec {
  id: string
  width: number
  anchor: string
  strategy: Strategy
  gap?: number
  /** Height / width of the character's viewBox (defaults to the walking rig). */
  aspect?: number
  /** Fraction of the box height where the ground line sits (defaults to BASELINE). */
  baseline?: number
  /** When it does not fit beside the anchor, shrink into the free room instead of dropping below. */
  shrinkToFit?: boolean
  /** Below this viewport width the actor stays hidden (walks need free space). */
  minWidth?: number
  /** Plays the once-per-session walk-in greeting instead of standing at its anchor. */
  greeter?: boolean
  initState?: MascotState
  /** One-shot state played once the actor becomes visible. */
  greet?: MascotState
  reactState?: MascotState
  triggers?: string[]
}

interface ActorData {
  spec: ActorSpec
  width: number
  height: number
  x: number
  y: number
  targetX: number
  targetY: number
  facing: 1 | -1
  state: MascotState
  visible: boolean
  placed: boolean
  walking: boolean
  arrived: boolean
  /** Greeter sequence stage; `null` when idle or finished. */
  stage: 'wave' | 'out' | null
  bubble: boolean
  startX: number
  walkDuration: number
  offscreen: boolean
  cooldownUntil: number
  timers: ReturnType<typeof setTimeout>[]
}

const SCENES: Record<string, ActorSpec[]> = {
  home: [
    {
      id: 'hero-clawd',
      width: 150,
      anchor: 'hero-links',
      strategy: 'right-of',
      gap: 34,
      minWidth: 1024,
      greeter: true
    }
  ],
  books: [
    {
      id: 'books-clawd',
      width: 140,
      aspect: 17 / 21,
      baseline: 0.94,
      anchor: 'books-title',
      strategy: 'right-of',
      gap: 20,
      shrinkToFit: true,
      initState: 'read'
    }
  ],
  projects: [
    {
      id: 'projects-clawd',
      width: 190,
      aspect: 17 / 31,
      baseline: 0.88,
      anchor: 'projects-title',
      strategy: 'right-of',
      gap: 20,
      shrinkToFit: true,
      initState: 'exercise'
    }
  ],
  blog: [
    {
      id: 'blog-clawd',
      width: 132,
      anchor: 'blog-empty',
      strategy: 'right-of',
      gap: 24,
      greet: 'wave'
    }
  ]
}

/** Scenes scale down on narrower viewports but stay visible. */
function scaleFor(vw: number) {
  return vw < 640 ? 0.7 : vw < 1024 ? 0.85 : 1
}

/** Route path → scene key, with the i18n prefix (/pt, /es) stripped. */
function sceneKeyFor(path: string): string {
  const stripped = path.replace(/^\/(?:pt|es)(?=\/|$)/, '')
  return stripped.replace(/^\//, '').replace(/\/$/, '') || 'home'
}

const route = useRoute()
const { t } = useI18n()
const { active, reducedMotion } = useMascots()

const actors = ref<ActorData[]>([])
const layerHeight = ref(0)
const hiddenTab = ref(false)

let anchorIOs: IntersectionObserver[] = []
let actorIO: IntersectionObserver | null = null
let resizeDebounce: ReturnType<typeof setTimeout> | null = null
let heightDebounce: ReturnType<typeof setTimeout> | null = null
let lastTriggerEl: Element | null = null
let disposed = false

function motionAllowed() {
  return active.value && reducedMotion.value !== 'reduce' && !document.hidden
}

function clearActorTimers(a: ActorData) {
  a.timers.forEach(clearTimeout)
  a.timers = []
}

function teardown() {
  actors.value.forEach(clearActorTimers)
  anchorIOs.forEach(io => io.disconnect())
  anchorIOs = []
  actorIO?.disconnect()
  actorIO = null
  actors.value = []
  lastTriggerEl = null
}

function placeActor(a: ActorData) {
  const el = document.querySelector(`[data-mascot-anchor="${a.spec.anchor}"]`)
  if (!el) {
    a.visible = false
    a.placed = false
    return
  }
  if (a.spec.minWidth && window.innerWidth < a.spec.minWidth) {
    a.visible = false
    a.placed = false
    return
  }

  const rect = el.getBoundingClientRect()
  const sx = window.scrollX
  const sy = window.scrollY
  const vw = window.innerWidth
  a.width = Math.round(a.spec.width * scaleFor(vw))
  a.height = Math.round(a.width * (a.spec.aspect ?? ASPECT))
  let w = a.width
  let h = a.height
  const gap = a.spec.gap ?? 24
  let x = 0
  let y = 0

  switch (a.spec.strategy) {
    case 'right-of': {
      x = rect.right + sx + gap
      y = rect.top + sy + rect.height - h * (a.spec.baseline ?? BASELINE)
      if (x + w > vw - 8) {
        const room = vw - 8 - (rect.right + 8)
        if (a.spec.shrinkToFit && room >= MIN_FIT_WIDTH) {
          w = Math.round(room)
          h = Math.round(w * (a.spec.aspect ?? ASPECT))
          a.width = w
          a.height = h
          x = rect.right + sx + 8
          y = rect.top + sy + rect.height - h * (a.spec.baseline ?? BASELINE)
        } else {
          x = rect.left + sx + (rect.width - w) / 2
          y = rect.bottom + sy + gap
        }
      }
      break
    }
    case 'below-center': {
      x = rect.left + sx + (rect.width - w) / 2
      y = rect.bottom + sy + gap
      break
    }
  }

  a.targetX = Math.round(x)
  a.targetY = Math.round(y)
  a.y = a.targetY
  a.x = a.targetX
  a.placed = true
}

function placeAll() {
  actors.value.forEach(placeActor)
}

function greeterSeen() {
  try {
    return window.sessionStorage.getItem(GREET.sessionKey) === '1'
  } catch {
    return false
  }
}

function markGreeterSeen() {
  try {
    window.sessionStorage.setItem(GREET.sessionKey, '1')
  } catch {
    // sessionStorage unavailable (private mode / blocked) — the greeter may replay on reload.
  }
}

/**
 * Waits until the current DOM state has actually been rendered. One rAF is not enough: its
 * callback runs *before* the frame's style recalculation, so a following write would replace the
 * pending value before the browser ever computed it, and no CSS transition would start.
 */
async function nextPaint() {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

/** Stage 1: appear at the spot (fade-in) and start waving with the bubble. */
function startGreeter(a: ActorData) {
  if (!a.placed || a.arrived || !motionAllowed() || greeterSeen())
    return
  a.arrived = true
  markGreeterSeen()
  a.startX = Math.min(a.targetX + GREET.exitDx, window.innerWidth + 10)
  a.x = a.targetX
  a.facing = 1
  a.stage = 'wave'
  a.state = 'wave'
  a.bubble = true
  a.visible = true
  a.timers.push(setTimeout(() => leaveGreeter(a), GREET.waveS * 1000))
}

/** Stage 2: walk off to the right edge, fading out on the way. */
async function leaveGreeter(a: ActorData) {
  a.bubble = false
  a.stage = 'out'
  a.state = 'bye'
  a.facing = -1
  a.walkDuration = GREET.byeS
  a.walking = true
  await nextPaint()
  if (disposed || a.stage !== 'out')
    return
  a.x = a.startX
  a.timers.push(setTimeout(() => {
    a.visible = false
  }, GREET.fadeAtS * 1000))
  a.timers.push(setTimeout(() => finishWalk(a), a.walkDuration * 1000 + 500))
}

function advanceGreeter(a: ActorData) {
  if (a.stage === 'out') {
    a.stage = null
    a.visible = false
    a.state = 'idle'
  }
}

function cancelGreeter(a: ActorData) {
  if (!a.stage)
    return
  clearActorTimers(a)
  a.stage = null
  a.walking = false
  a.bubble = false
  a.visible = false
}

function finishWalk(a: ActorData) {
  if (!a.walking)
    return
  a.walking = false
  if (a.spec.greeter) {
    advanceGreeter(a)
    return
  }
  a.x = a.targetX
  a.state = a.spec.initState ?? 'idle'
}

function finishAllWalks() {
  actors.value.forEach(a => a.spec.greeter ? cancelGreeter(a) : finishWalk(a))
}

function reveal(a: ActorData) {
  if (!a.placed || a.visible)
    return
  a.visible = true
  a.x = a.targetX
  a.y = a.targetY
  if (a.spec.greet && motionAllowed()) {
    a.state = a.spec.greet
    a.timers.push(setTimeout(() => {
      if (!a.walking)
        a.state = a.spec.initState ?? 'idle'
    }, 1900))
  }
}

function react(a: ActorData) {
  if (!motionAllowed() || !a.placed || a.walking)
    return
  if (Date.now() < a.cooldownUntil)
    return
  a.cooldownUntil = Date.now() + 20000
  a.state = a.spec.reactState ?? 'wave'
  a.timers.push(setTimeout(() => {
    if (!a.walking)
      a.state = a.spec.initState ?? 'idle'
  }, 1800))
}

function fireTrigger(key: string | null) {
  if (!key || !motionAllowed())
    return
  actors.value.forEach((a) => {
    if (a.spec.triggers?.includes(key))
      react(a)
  })
}

function onPointerOver(event: PointerEvent) {
  const target = event.target as Element | null
  const el = target?.closest?.('[data-mascot-trigger]') ?? null
  if (!el || el === lastTriggerEl)
    return
  lastTriggerEl = el
  fireTrigger(el.getAttribute('data-mascot-trigger'))
}

function onFocusIn(event: FocusEvent) {
  const el = (event.target as Element | null)?.closest?.('[data-mascot-trigger]') ?? null
  if (!el)
    return
  fireTrigger(el.getAttribute('data-mascot-trigger'))
}

function onTransitionEnd(event: TransitionEvent) {
  if (event.propertyName !== 'transform')
    return
  // Ignore bubbles/children: only the actor's own walk transition counts.
  const el = (event.target as Element).closest?.('[data-mascot-actor]')
  if (el !== event.target)
    return
  const id = el?.getAttribute('data-mascot-actor')
  const a = actors.value.find(candidate => candidate.spec.id === id)
  if (a)
    finishWalk(a)
}

/** One-shot IntersectionObserver helper. */
function observeOnce(el: Element, ratio: number, fn: () => void) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      io.disconnect()
      fn()
    }
  }, { threshold: ratio })
  io.observe(el)
  anchorIOs.push(io)
}

function wireScene() {
  // Fade-in reveals for persistent actors.
  for (const a of actors.value) {
    if (a.spec.greeter)
      continue
    const el = document.querySelector(`[data-mascot-anchor="${a.spec.anchor}"]`)
    if (el)
      observeOnce(el, 0.2, () => reveal(a))
  }
}

function observeActorsOffscreen() {
  actorIO?.disconnect()
  actorIO = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const id = (entry.target as Element).getAttribute('data-mascot-actor')
      const a = actors.value.find(candidate => candidate.spec.id === id)
      if (a)
        a.offscreen = !entry.isIntersecting
    }
  }, { rootMargin: '80px 0px' })
  document.querySelectorAll('.mascot-world [data-mascot-actor]').forEach((el) => {
    actorIO?.observe(el)
  })
}

function syncHeight() {
  layerHeight.value = document.documentElement.scrollHeight
}

function buildScene() {
  if (disposed)
    return
  teardown()
  const specs = SCENES[sceneKeyFor(route.path)] ?? []
  actors.value = specs.map(spec => ({
    spec,
    width: spec.width,
    height: Math.round(spec.width * ASPECT),
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    facing: 1,
    state: spec.initState ?? 'idle',
    visible: false,
    placed: false,
    walking: false,
    arrived: false,
    stage: null,
    bubble: false,
    startX: 0,
    walkDuration: 1.5,
    offscreen: false,
    cooldownUntil: 0,
    timers: []
  }))
  placeAll()
  wireScene()
  nextTick(() => {
    observeActorsOffscreen()
    syncHeight()
    // Home: the greeter walks in shortly after the hero settles (once per session).
    const greeter = actors.value.find(a => a.spec.greeter)
    if (greeter?.placed)
      greeter.timers.push(setTimeout(() => startGreeter(greeter), 650))
  })
}

function scheduleRebuild() {
  if (heightDebounce)
    clearTimeout(heightDebounce)
  heightDebounce = setTimeout(() => {
    if (disposed)
      return
    syncHeight()
    placeAll()
    observeActorsOffscreen()
  }, 250)
}

function scheduleReplace() {
  if (resizeDebounce)
    clearTimeout(resizeDebounce)
  resizeDebounce = setTimeout(() => {
    if (disposed)
      return
    finishAllWalks()
    placeAll()
    observeActorsOffscreen()
    syncHeight()
  }, 200)
}

watch(() => route.path, () => {
  nextTick(() => {
    requestAnimationFrame(() => buildScene())
  })
})

watch(active, (value) => {
  if (!value)
    finishAllWalks()
})

watch(reducedMotion, (value) => {
  if (value === 'reduce')
    finishAllWalks()
})

onMounted(() => {
  document.addEventListener('pointerover', onPointerOver, { passive: true })
  document.addEventListener('focusin', onFocusIn, { passive: true })
  window.addEventListener('resize', scheduleReplace, { passive: true })
  window.addEventListener('load', scheduleRebuild, { passive: true })
  document.addEventListener('visibilitychange', () => {
    hiddenTab.value = document.hidden
    if (document.hidden)
      finishAllWalks()
  })
  const ro = new ResizeObserver(scheduleRebuild)
  ro.observe(document.body)
  buildScene()
})

onBeforeUnmount(() => {
  disposed = true
  teardown()
  if (heightDebounce)
    clearTimeout(heightDebounce)
  if (resizeDebounce)
    clearTimeout(resizeDebounce)
  document.removeEventListener('pointerover', onPointerOver)
  document.removeEventListener('focusin', onFocusIn)
  window.removeEventListener('resize', scheduleReplace)
  window.removeEventListener('load', scheduleRebuild)
})
</script>

<template>
  <Teleport to="body">
    <div
      class="mascot-world"
      :class="{ 'mascots-paused': !active || hiddenTab }"
      :style="{ height: `${layerHeight}px` }"
      aria-hidden="true"
      @transitionend="onTransitionEnd"
    >
      <div
        v-for="a in actors"
        :key="a.spec.id"
        :data-mascot-actor="a.spec.id"
        class="mascot-actor"
        :class="[
          a.walking && 'is-walking',
          !a.visible && 'is-hidden',
          a.offscreen && 'offscreen'
        ]"
        :style="{
          'width': `${a.width}px`,
          'transform': `translate3d(${a.x}px, ${a.y}px, 0)`,
          '--mascot-walk-duration': `${a.walkDuration}s`,
          '--mascot-wave-duration': a.spec.greeter ? `${GREET.waveS}s` : undefined
        }"
      >
        <div
          v-if="a.spec.greeter"
          class="mascot-bubble"
          :class="{ 'is-on': a.bubble }"
          aria-hidden="true"
        >
          {{ t('mascots.greeting') }}
        </div>
        <MascotActor
          :state="a.state"
          :facing="a.facing"
        />
      </div>
    </div>
  </Teleport>
</template>
