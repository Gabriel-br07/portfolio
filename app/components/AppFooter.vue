<script setup lang="ts">
const { t } = useI18n()
const { footer } = useAppConfig()
const year = new Date().getFullYear()
const { open: openContactModal } = useContactModal()

function isMailFooterLink(link: { to?: string, icon?: string }) {
  const to = String(link.to ?? '')
  const icon = String(link.icon ?? '')
  return icon.includes('lucide-mail') || to.startsWith('mailto:')
}
</script>

<template>
  <UFooter
    class="z-10 bg-default"
    :ui="{ left: 'text-muted text-xs' }"
  >
    <template #left>
      {{ t('footer.credits', { year }) }}
    </template>

    <template #right>
      <template v-if="footer?.links?.length">
        <template
          v-for="(link, index) of footer?.links"
          :key="index"
        >
          <UButton
            v-if="isMailFooterLink(link)"
            size="xs"
            color="neutral"
            variant="ghost"
            :icon="link.icon"
            :aria-label="link['aria-label']"
            @click="openContactModal()"
          />
          <UButton
            v-else
            v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
          />
        </template>
      </template>
    </template>
  </UFooter>
</template>
