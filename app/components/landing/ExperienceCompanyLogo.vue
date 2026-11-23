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

const darkLogo = computed(() => DARK_LOGO_VARIANTS[logo.value])
const size = sizeOfLogo
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
