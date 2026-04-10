<script setup lang="ts">
import type { Swiper as SwiperInstance } from 'swiper/types'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

type TechItem = { key: string, src: string, label: string, alt: string }

const { t } = useI18n()
const prefersReducedMotion = usePreferredReducedMotion()

/** Explicit `.value` check for template + script (avoids relying on template ref unwrapping for comparisons). */
const isReducedMotion = computed(() => prefersReducedMotion.value === 'reduce')

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

const swiperRef = shallowRef<SwiperInstance | null>(null)

const hoveredSlideKey = ref<string | null>(null)

const autoplayConfig = computed(() => {
  if (isReducedMotion.value) return false
  return {
    delay: 0,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
    reverseDirection: false,
    waitForTransition: true
  }
})

function onSwiper(swiper: SwiperInstance) {
  swiperRef.value = swiper
}

function onTileEnter(slideKey: string) {
  hoveredSlideKey.value = slideKey
  swiperRef.value?.autoplay?.stop()
}

function onTileLeave() {
  hoveredSlideKey.value = null
  swiperRef.value?.autoplay?.start()
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

/** Static list: same grayscale / color behavior as carousel tiles */
const staticMediaInteractive
  = `${techMediaSize} ${techMediaTransition} text-muted grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03] group-focus-visible:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:scale-[1.03]`

function tileClass(slideKey: string) {
  return [
    'flex flex-col items-center justify-center gap-1.5 px-0.5 py-1 sm:gap-2 sm:px-1 sm:py-1.5 rounded-lg sm:rounded-xl outline-none transition-[box-shadow,background-color] duration-200',
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
        <div
          v-if="isReducedMotion"
          class="mx-auto max-w-6xl px-4 sm:px-6"
        >
          <div
            class="flex flex-wrap justify-center gap-x-6 gap-y-4 sm:gap-x-7 sm:gap-y-5"
            role="list"
          >
            <div
              v-for="item in techItems"
              :key="item.key"
              role="listitem"
              tabindex="0"
              class="group flex min-w-[3.75rem] flex-col items-center gap-1.5 rounded-lg p-1 outline-none transition-colors focus-visible:ring-1 focus-visible:ring-default sm:min-w-[4rem] sm:gap-2 sm:rounded-xl sm:p-1.5 hover:bg-elevated/40 focus-visible:bg-elevated/40"
            >
              <img
                :src="item.src"
                :alt="item.alt"
                :class="staticMediaInteractive"
                width="36"
                height="36"
                loading="lazy"
                decoding="async"
              >
              <span class="max-w-[5.5rem] text-center text-[0.6875rem] leading-tight text-muted sm:text-xs">{{
                item.label
              }}</span>
            </div>
          </div>
        </div>
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
              @swiper="onSwiper"
            >
              <SwiperSlide
                v-for="{ item, slideKey } in swiperSlides"
                :key="slideKey"
                class="!w-[4.25rem] shrink-0 sm:!w-[4.5rem] lg:!w-[5rem]"
              >
                <div
                  :class="tileClass(slideKey)"
                  tabindex="0"
                  @mouseenter="onTileEnter(slideKey)"
                  @mouseleave="onTileLeave"
                  @focusin="onTileEnter(slideKey)"
                  @focusout="onTileLeave"
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
