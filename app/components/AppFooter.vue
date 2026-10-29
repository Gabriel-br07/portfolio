<script setup lang="ts">
const { t } = useI18n()
const { footer } = useAppConfig()
const year = new Date().getFullYear()
const { open: openContactModal } = useContactModal()
const { public: { gaMeasurementId } } = useRuntimeConfig()
const { revoke: revokeConsent } = useAnalyticsConsent()
const { active: mascotsActive, restore: restoreMascots, setActive: setMascotsActive } = useMascots()

// Restores the persisted preference after hydration (never during SSR).
onMounted(restoreMascots)
</script>

<template>
  <UFooter
    class="z-10 bg-default"
    :ui="{ left: 'text-muted text-xs' }"
  >
    <template #left>
      {{ t('footer.credits', { year }) }}
      <span class="block">
        <ULink
          to="https://github.com/xixicc186/clawd-emotes-skill"
          target="_blank"
          rel="noopener noreferrer"
        >{{ t('footer.mascotCredit') }}</ULink>
      </span>
    </template>

    <template #right>
      <template v-if="footer?.links?.length">
        <template
          v-for="(link, index) of footer?.links"
          :key="index"
        >
          <UButton
            v-if="isMailLink(link)"
            size="xs"
            class="cursor-pointer"
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
      <UButton
        v-if="gaMeasurementId"
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-cookie"
        :aria-label="t('footer.cookieSettings')"
        :title="t('footer.cookieSettings')"
        @click="revokeConsent()"
      />
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        :icon="mascotsActive ? 'i-lucide-pause' : 'i-lucide-play'"
        :aria-label="mascotsActive ? t('footer.mascotsPause') : t('footer.mascotsResume')"
        :title="mascotsActive ? t('footer.mascotsPause') : t('footer.mascotsResume')"
        @click="setMascotsActive(!mascotsActive)"
      />
    </template>
  </UFooter>
</template>
