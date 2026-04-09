<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const shortByCode: Record<string, string> = {
  en: 'EN',
  pt: 'PT',
  es: 'ESP'
}

const currentShort = computed(() => shortByCode[locale.value] ?? locale.value.toUpperCase())

const items = computed<DropdownMenuItem[][]>(() => {
  const codes = ['en', 'pt', 'es'] as const
  return [
    codes.map(code => ({
      label: shortByCode[code],
      disabled: locale.value === code,
      to: switchLocalePath(code)
    }))
  ]
})
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton
      :aria-label="$t('locale.ariaSwitch')"
      color="neutral"
      variant="ghost"
      size="sm"
      class="rounded-full font-medium tabular-nums min-w-10"
    >
      {{ currentShort }}
    </UButton>
  </UDropdownMenu>
</template>
