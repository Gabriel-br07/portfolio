<script setup lang="ts">
import type { ExperienceItem } from '~/types/experience'

const props = defineProps<{
  experience: ExperienceItem
  /** Above-the-fold logo: skip lazy loading. */
  eager?: boolean
}>()

const { t } = useI18n()

const company = computed(() => props.experience.company)
const logo = computed(() => company.value?.logo ?? '')
const isImage = computed(() => logo.value.startsWith('/'))
const alt = computed(() => t('experience.logoAlt', { name: company.value?.name ?? '' }))

// Logos that have a dedicated dark-theme variant.
const DARK_VARIANTS: Record<string, string> = {
  '/logos/DW-Corp-logo.svg': '/logos/DW-Corp-logo-white-transparent.webp',
  '/logos/oby-capital-logo.webp': '/logos/oby-capital-logo-white-transparent.webp'
}

// Intrinsic sizes of the files in public/logos (width x height). Every file is cropped to its visible
// artwork (no transparent padding), so the same wrapper height renders all logos at a comparable size. They only give the browser the aspect
// ratio before the image loads; the rendered height is fixed by the wrapper (`h-6 sm:h-7`).
const LOGO_SIZES: Record<string, [number, number]> = {
  '/logos/oby-capital-logo.webp': [256, 85],
  '/logos/oby-capital-logo-white-transparent.webp': [256, 85],
  '/logos/DW-Corp-logo.svg': [419, 104],
  '/logos/DW-Corp-logo-white-transparent.webp': [131, 33],
  '/logos/serpro.svg': [270, 73]
}

const darkLogo = computed(() => DARK_VARIANTS[logo.value])
const size = (src: string) => LOGO_SIZES[src] ?? [256, 96]
</script>

<template>
  <div
    v-if="logo"
    class="flex h-6 shrink-0 items-center sm:h-7"
  >
    <template v-if="isImage">
      <img
        :width="size(logo)[0]"
        :height="size(logo)[1]"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        :src="logo"
        :alt
        class="h-full w-auto max-w-40 object-contain object-left"
        :class="{ 'dark:hidden': darkLogo }"
      >
      <img
        v-if="darkLogo"
        :width="size(darkLogo)[0]"
        :height="size(darkLogo)[1]"
        :loading="eager ? 'eager' : 'lazy'"
        decoding="async"
        :src="darkLogo"
        :alt
        class="hidden h-full w-auto max-w-40 object-contain object-left dark:block"
      >
    </template>
    <UIcon
      v-else
      :name="logo"
      class="size-full"
    />
  </div>
</template>
