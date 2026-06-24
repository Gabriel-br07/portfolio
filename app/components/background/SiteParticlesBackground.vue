<script setup lang="ts">
/**
 * Decorative global background — subtle particles in the left/right gutters that
 * give a light depth/parallax impression without competing with content.
 *
 * Pure CSS (no canvas, no window/document), so it renders identically on the
 * server and client: SSR-safe with no hydration mismatch. Colours come from CSS
 * variables defined in `assets/css/main.css`, so it adapts automatically to the
 * `.dark` class toggled by @nuxtjs/color-mode. The centre column is masked out
 * and the whole layer is `pointer-events: none`.
 */
const route = useRoute()

// Stronger on the home pages, calmer on internal pages (route-aware intensity).
const HOME_PATHS = new Set(['/', '/pt', '/es'])
const isHome = computed(() => {
  const path = route.path !== '/' ? route.path.replace(/\/+$/, '') : '/'
  return HOME_PATHS.has(path || '/')
})

// Deterministic pseudo-random (sine hash) — identical on server and client.
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

interface Particle {
  id: number
  side: 'left' | 'right'
  top: number
  x: number
  size: number
  dur: number
  delay: number
  opacity: number
  drift: number
  sway: number
  mobileHidden: boolean
}

const PARTICLE_COUNT = 28
const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i): Particle => {
  const r1 = seeded(i + 1)
  const r2 = seeded(i + 11)
  const r4 = seeded(i + 37)
  const depth = seeded(i + 23) // 0 (far) .. 1 (near) → drives size/opacity/travel
  return {
    id: i,
    side: i % 2 === 0 ? 'left' : 'right',
    top: Math.round(r1 * 100),
    x: Math.round(1 + r2 * 15), // 1%..16% from the side edge
    size: Math.round((1.5 + depth * 3) * 10) / 10, // 1.5..4.5px
    dur: Math.round(16 + r4 * 16), // 16..32s (slow)
    delay: -Math.round(r2 * 24), // desync, negative start
    opacity: Math.round((0.25 + depth * 0.45) * 100) / 100, // 0.25..0.70
    drift: Math.round(18 + depth * 34), // 18..52px vertical travel
    sway: Math.round((r4 - 0.5) * 16), // -8..8px horizontal sway
    mobileHidden: i % 2 === 1 && r1 > 0.4 // thin out on small screens
  }
})
</script>

<template>
  <div
    class="site-particles"
    :class="{ 'is-home': isHome }"
    aria-hidden="true"
  >
    <span
      v-for="p in particles"
      :key="p.id"
      class="site-particles__dot"
      :class="[`is-${p.side}`, { 'is-mobile-hidden': p.mobileHidden }]"
      :style="{
        top: `${p.top}%`,
        '--x': `${p.x}%`,
        '--size': `${p.size}px`,
        '--dur': `${p.dur}s`,
        '--delay': `${p.delay}s`,
        '--o': p.opacity,
        '--drift': `${p.drift}px`,
        '--sway': `${p.sway}px`
      }"
    />
  </div>
</template>

<style scoped>
.site-particles {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  contain: layout paint style;
  opacity: 0.6;
  transition: opacity 0.6s ease;
  /* Fade particles out before they reach the centred content column. */
  --edge: 22%;
  -webkit-mask-image: linear-gradient(to right, #000 0%, #000 var(--edge), transparent 42%, transparent 58%, #000 calc(100% - var(--edge)), #000 100%);
  mask-image: linear-gradient(to right, #000 0%, #000 var(--edge), transparent 42%, transparent 58%, #000 calc(100% - var(--edge)), #000 100%);
}

.site-particles.is-home {
  opacity: 1;
}

/* Subtle side glow. */
.site-particles::before,
.site-particles::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 36%;
}

.site-particles::before {
  left: 0;
  background: radial-gradient(60% 55% at 0% 50%, rgb(var(--particles-glow) / 0.1), transparent 70%);
}

.site-particles::after {
  right: 0;
  background: radial-gradient(60% 55% at 100% 50%, rgb(var(--particles-glow) / 0.1), transparent 70%);
}

.site-particles__dot {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 9999px;
  background: rgb(var(--particles-color) / var(--o));
  box-shadow: 0 0 calc(var(--size) * 2.2) rgb(var(--particles-glow) / calc(var(--o) * 0.55));
  will-change: transform;
  animation: site-particles-drift var(--dur) ease-in-out var(--delay) infinite;
}

.site-particles__dot.is-left {
  left: var(--x);
}

.site-particles__dot.is-right {
  right: var(--x);
}

@keyframes site-particles-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(var(--sway), calc(var(--drift) * -1), 0);
  }
}

@media (max-width: 640px) {
  .site-particles {
    --edge: 14%;
  }

  .site-particles__dot.is-mobile-hidden {
    display: none;
  }
}

/* Respect reduced motion: keep a static, low-opacity field (no movement). */
@media (prefers-reduced-motion: reduce) {
  .site-particles__dot {
    animation: none;
  }
}
</style>
