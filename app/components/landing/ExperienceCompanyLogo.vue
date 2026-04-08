<script setup lang="ts">
import type { ExperienceItem } from '~/types/experience'

const props = defineProps<{
  experience: ExperienceItem
  variant: 'link' | 'plain'
}>()

const colorMode = useColorMode()

function isSerpro(experience: ExperienceItem) {
  const name = (experience.company?.name || '').toLowerCase()
  const logo = (experience.company?.logo || '').toLowerCase()
  return name.includes('serpro') || logo.includes('serpro')
}

function isDWCorp(experience: ExperienceItem) {
  const name = (experience.company?.name || '').toLowerCase()
  const logo = (experience.company?.logo || '').toLowerCase()
  return name.includes('dw corp') || logo.includes('dw-corp')
}

const isDarkTheme = computed(() => colorMode.value === 'dark')

function getLogoPath(experience: ExperienceItem) {
  const logo = experience.company?.logo
  if (!logo) return ''
  if (isDWCorp(experience)) {
    return isDarkTheme.value
      ? '/logos/DW-Corp-logo-white-transparent.png'
      : logo
  }
  return logo
}

const wrapperClass = computed(() => {
  const base = 'relative shrink-0 h-7 w-7 sm:h-8 sm:w-8 overflow-visible'
  if (props.variant === 'plain') {
    return base
  }
  return [base, isDWCorp(props.experience) ? 'ml-4' : 'ml-3']
})
</script>

<template>
  <div
    v-if="props.experience.company?.logo"
    :class="wrapperClass"
    :style="{ color: props.experience.company.color }"
  >
    <template v-if="props.experience.company.logo.startsWith('/')">
      <ClientOnly v-if="isDWCorp(props.experience)">
        <img
          :src="getLogoPath(props.experience)"
          :alt="props.experience.company.name + ' logo'"
          :class="[
            props.variant === 'link'
              ? 'absolute left-1/2 top-[4%] -translate-x-1/2'
              : 'absolute left-1/2 top-[54%] -translate-x-1/2',
            'h-full w-full object-contain',
            props.variant === 'link' ? 'scale-[4]' : 'scale-[2]'
          ]"
        >
        <template #fallback>
          <img
            :src="props.experience.company.logo"
            :alt="props.experience.company.name + ' logo'"
            :class="[
              props.variant === 'link'
                ? 'absolute left-1/2 top-[4%] -translate-x-1/2'
                : 'absolute left-1/2 top-[54%] -translate-x-1/2',
              'h-full w-full object-contain',
              props.variant === 'link' ? 'scale-[4]' : 'scale-[2]'
            ]"
          >
        </template>
      </ClientOnly>
      <img
        v-else
        :src="getLogoPath(props.experience)"
        :alt="props.experience.company.name + ' logo'"
        :class="[
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'h-full w-full object-contain',
          isSerpro(props.experience) ? 'scale-[2]' : ''
        ]"
      >
    </template>
    <template v-else>
      <UIcon
        :name="props.experience.company.logo"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full"
      />
    </template>
  </div>
</template>
