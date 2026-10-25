<script setup lang="ts">
import type { IndexCollectionItem } from '@nuxt/content'

const { footer, global } = useAppConfig()
const { t } = useI18n()
const { open: openContactModal } = useContactModal()

defineProps<{
  page: IndexCollectionItem
}>()

/** Hero already has a View LinkedIn CTA; omit duplicate LinkedIn icon here. */
const heroSocialLinks = computed(() => {
  const links = footer?.links ?? []
  return links.filter((link) => {
    const to = String((link as { to?: string }).to ?? '')
    const icon = String((link as { icon?: string }).icon ?? '')
    if (icon.includes('linkedin')) return false
    if (to.includes('linkedin.com')) return false
    return true
  })
})
</script>

<template>
  <UPageHero
    :ui="{
      headline: 'flex items-center justify-center',
      title: 'text-shadow-md max-w-lg mx-auto',
      links: 'mt-4 flex-col justify-center items-center'
    }"
  >
    <template #headline>
      <UColorModeAvatar
        class="size-18 ring ring-default ring-offset-3 ring-offset-(--ui-bg)"
        :light="global.picture?.light!"
        :dark="global.picture?.dark!"
        :alt="t('hero.profileAlt')"
      />
    </template>

    <template #title>
      {{ page.title }}
    </template>

    <template #description>
      {{ page.description }}
    </template>

    <template #links>
      <div
        class="hero-enter"
        style="--hero-delay: 0.2s"
      >
        <div
          v-if="page.hero.links"
          class="flex items-center gap-2"
          data-mascot-anchor="hero-links"
        >
          <UButton v-bind="page.hero.links[0]" />
          <UButton
            :disabled="!global.available"
            :color="global.available ? 'success' : 'error'"
            variant="ghost"
            class="gap-2"
            :class="{ 'opacity-80': !global.available }"
            :label="global.available ? t('hero.available') : t('hero.unavailable')"
            @click="openContactModal()"
          >
            <template #leading>
              <span class="relative flex size-2">
                <span
                  class="absolute inline-flex size-full rounded-full opacity-75"
                  :class="global.available ? 'bg-success animate-ping' : 'bg-error'"
                />
                <span
                  class="relative inline-flex size-2 scale-90 rounded-full"
                  :class="global.available ? 'bg-success' : 'bg-error'"
                />
              </span>
            </template>
          </UButton>
        </div>
      </div>

      <div
        v-if="heroSocialLinks.length"
        class="gap-x-4 inline-flex mt-4"
      >
        <div
          v-for="(link, index) of heroSocialLinks"
          :key="index"
          class="hero-enter"
          :style="{ '--hero-delay': `${0.2 + index * 0.05}s` }"
        >
          <UButton
            v-if="isMailLink(link)"
            size="md"
            color="neutral"
            class="cursor-pointer"
            variant="ghost"
            :icon="link.icon"
            :aria-label="link['aria-label']"
            @click="openContactModal()"
          />
          <UButton
            v-else
            v-bind="{ size: 'md', color: 'neutral', variant: 'ghost', ...link }"
          />
        </div>
      </div>
    </template>

    <UMarquee
      pause-on-hover
      class="py-2 -mx-8 sm:-mx-12 lg:-mx-16 [--duration:40s]"
    >
      <div
        v-for="(img, index) in page.hero.images"
        :key="index"
        class="hero-enter"
        :style="{ '--hero-delay': `${index * 0.05}s` }"
      >
        <NuxtImg
          width="234"
          height="234"
          class="rounded-lg aspect-square object-cover"
          :class="index % 2 === 0 ? '-rotate-2' : 'rotate-2'"
          v-bind="img"
        />
      </div>
    </UMarquee>
  </UPageHero>
</template>
