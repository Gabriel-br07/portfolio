<script setup lang="ts">
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

type TechItem = { key: string, src: string, label: string, alt: string }

const { t } = useI18n()
const prefersReducedMotion = usePreferredReducedMotion()

/**
 * SSR + first client paint: always false until mount, so server and hydration both render
 * the static grid (stable markup). After mount, true only when motion is allowed — then Swiper mounts
 * with autoplay; reduced-motion users keep the static grid.
 */
const hasMounted = ref(false)
onMounted(() => {
  hasMounted.value = true
})

const showAnimatedCarousel = computed(
  () => hasMounted.value && prefersReducedMotion.value === 'no-preference'
)

/** Enough repeats for Swiper `loop` + `slides-per-view="auto"` on wide viewports */
const SWIPER_REPEAT_COUNT = 4

const sectionUi = {
  container: '!pt-8 !pb-6 sm:!pt-10 sm:!pb-8',
  title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
  description: 'mt-0'
}

const techItems: readonly TechItem[] = [
  { key: 'linux', src: '/icons/tech/linux.svg', label: 'Linux', alt: 'Linux' },
  { key: 'python', src: '/icons/tech/python.svg', label: 'Python', alt: 'Python' },
  { key: 'dotnet', src: '/icons/tech/dotnet.svg', label: '.NET', alt: '.NET' },
  { key: 'csharp', src: '/icons/tech/csharp.svg', label: 'C#', alt: 'C#' },
  { key: 'react', src: '/icons/tech/react.svg', label: 'React', alt: 'React' },
  { key: 'vue', src: '/icons/tech/vue.svg', label: 'Vue', alt: 'Vue' },
  { key: 'nuxt', src: '/icons/tech/nuxt.svg', label: 'Nuxt', alt: 'Nuxt' },
  { key: 'go', src: '/icons/tech/go-gopher.svg', label: 'Go', alt: 'Go Gopher' },
  { key: 'rust', src: '/icons/tech/rust-ferris.png', label: 'Rust', alt: 'Ferris, the Rust mascot' },
  { key: 'docker', src: '/icons/tech/docker.svg', label: 'Docker', alt: 'Docker' },
  { key: 'postgresql', src: '/icons/tech/postgresql.svg', label: 'PostgreSQL', alt: 'PostgreSQL' },
  { key: 'mongodb', src: '/icons/tech/mongodb.svg', label: 'MongoDB', alt: 'MongoDB' }
]

const swiperSlides = computed(() => {
  const repeated: TechItem[] = []
  for (let r = 0; r < SWIPER_REPEAT_COUNT; r++) {
    repeated.push(...techItems)
  }
  return repeated.map((item, index) => ({ item, slideKey: `${item.key}-${index}` }))
})

const loopAdditionalSlides = techItems.length

const modules = [Autoplay]

const hoveredSlideKey = ref<string | null>(null)

const autoplayConfig = computed(() => ({
  delay: 0,
  disableOnInteraction: false,
  pauseOnMouseEnter: false,
  reverseDirection: false,
  waitForTransition: true
}))

/** Hover highlight only — autoplay is never stopped so the track stays in continuous motion. */
function onTileEnter(slideKey: string) {
  hoveredSlideKey.value = slideKey
}

function onTileLeave() {
  hoveredSlideKey.value = null
}

function isActive(slideKey: string) {
  return hoveredSlideKey.value === slideKey
}

/** Shared size + motion for icons and images (carousel + reduced-motion parity) */
const techMediaSize = 'size-8 sm:size-9 shrink-0 object-contain'
const techMediaTransition = 'transition-[filter,opacity,transform] duration-200 ease-out'

function mediaClass(slideKey: string) {
  const active = isActive(slideKey)
  return [
    techMediaSize,
    techMediaTransition,
    active
      ? 'grayscale-0 opacity-100 scale-[1.03]'
      : 'grayscale opacity-70'
  ]
}

/** Static list: hover parity with carousel; no focus styling (tiles are not interactive). */
const staticMediaHover
  = `${techMediaSize} ${techMediaTransition} text-muted grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03]`

function tileClass(slideKey: string) {
  return [
    'flex flex-col items-center justify-center gap-1.5 px-0.5 py-1 sm:gap-2 sm:px-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-[box-shadow,background-color] duration-200',
    isActive(slideKey)
      ? 'ring-1 ring-default bg-elevated/50'
      : 'ring-0'
  ]
}
</script>

<template>
  <UPageSection
    :title="t('home.techCarouselTitle')"
    :ui="sectionUi"
  >
    <template #description>
      <div class="mt-4 -mx-4 sm:-mx-6 overflow-hidden">
        <!-- SSR + pre-mount + reduced-motion: one stable tree (static grid). -->
        <div
          v-if="!showAnimatedCarousel"
          class="mx-auto max-w-6xl px-4 sm:px-6"
        >
          <ul
            class="m-0 flex list-none flex-wrap justify-center gap-x-6 gap-y-4 p-0 sm:gap-x-7 sm:gap-y-5"
          >
            <li
              v-for="item in techItems"
              :key="item.key"
              class="group flex min-w-[3.75rem] flex-col items-center gap-1.5 rounded-lg p-1 transition-colors sm:min-w-[4rem] sm:gap-2 sm:rounded-xl sm:p-1.5 hover:bg-elevated/40"
            >
              <img
                :src="item.src"
                :alt="item.alt"
                :class="staticMediaHover"
                width="36"
                height="36"
                loading="lazy"
                decoding="async"
              >
              <span class="max-w-[5.5rem] text-center text-[0.6875rem] leading-tight text-muted sm:text-xs">{{
                item.label
              }}</span>
            </li>
          </ul>
        </div>
        <!-- Client-only (gated by showAnimatedCarousel): Swiper never mounts on server or for reduced motion. -->
        <div
          v-else
          class="mx-auto max-w-3xl px-2 sm:px-1"
        >
          <div class="tech-carousel-viewport">
            <Swiper
              :modules="modules"
              loop
              :loop-additional-slides="loopAdditionalSlides"
              slides-per-view="auto"
              :space-between="12"
              :speed="4500"
              :allow-touch-move="false"
              :autoplay="autoplayConfig"
              class="tech-swiper"
              :breakpoints="{
                480: { spaceBetween: 14 },
                768: { spaceBetween: 16 },
                1024: { spaceBetween: 18 }
              }"
            >
              <SwiperSlide
                v-for="{ item, slideKey } in swiperSlides"
                :key="slideKey"
                class="!w-[4.25rem] shrink-0 sm:!w-[4.5rem] lg:!w-[5rem]"
              >
                <div
                  :class="tileClass(slideKey)"
                  @mouseenter="onTileEnter(slideKey)"
                  @mouseleave="onTileLeave"
                >
                  <img
                    :src="item.src"
                    :alt="item.alt"
                    :class="mediaClass(slideKey)"
                    width="36"
                    height="36"
                    loading="lazy"
                    decoding="async"
                  >
                  <span
                    class="max-w-full px-0.5 text-center text-[0.6875rem] leading-tight transition-colors duration-200 sm:text-xs"
                    :class="isActive(slideKey) ? 'text-highlighted' : 'text-muted'"
                  >{{ item.label }}</span>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
    </template>
  </UPageSection>
</template>

<style scoped>
.tech-carousel-viewport {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 4%,
    black 96%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    black 4%,
    black 96%,
    transparent
  );
}

@media (min-width: 640px) {
  .tech-carousel-viewport {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent,
      black 3%,
      black 97%,
      transparent
    );
    mask-image: linear-gradient(
      to right,
      transparent,
      black 3%,
      black 97%,
      transparent
    );
  }
}

.tech-swiper :deep(.swiper-wrapper) {
  transition-timing-function: linear !important;
}
</style>
