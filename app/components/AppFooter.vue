<script setup lang="ts">
const { t, locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { footer } = useAppConfig()
const year = new Date().getFullYear()
const { open: openContactModal } = useContactModal()
const { active: mascotsActive, restore: restoreMascots, setActive: setMascotsActive } = useMascots()

// Plain crawlable links to the same page in every language (the header dropdown only renders on click).
const localeLinks = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ESP' }
] as const

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
      <nav
        :aria-label="t('locale.ariaSwitch')"
        class="mt-1 flex gap-3"
      >
        <NuxtLink
          v-for="item in localeLinks"
          :key="item.code"
          :to="switchLocalePath(item.code)"
          :hreflang="item.code"
          :lang="item.code"
          :aria-current="item.code === locale ? 'true' : undefined"
          class="hover:text-default aria-[current=true]:font-semibold aria-[current=true]:text-default"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
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
