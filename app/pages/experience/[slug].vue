<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { track } = useAnalytics()
const { public: { siteUrl } } = useRuntimeConfig()

const slug = computed(() => String(route.params.slug))
const { data } = await useExperienceCase(slug)
if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

// One generated share image per case (`pnpm generate:og`), named after the slug.
const ogImagePath = computed(() => `/images/seo/og-${slug.value}.png`)

usePageSeo(() => ({
  title: data.value?.detail.title,
  description: data.value?.detail.description,
  ogType: 'article',
  image: ogImagePath.value,
  imageAlt: t('experience.ogImageAlt', { role: data.value?.detail.title ?? '' })
}))

// Reading progress for the side rail (desktop) and the top progress bar (phones/tablets).
const spy = useScrollSpy(() => (data.value?.detail.themes ?? []).map((_, i) => `theme-${i}`))

const breadcrumbs = computed(() => [
  { label: t('experience.breadcrumbHome'), to: localePath('/') },
  { label: t('experience.breadcrumbExperience'), to: `${localePath('/')}#experience` },
  { label: data.value?.item.company?.name ?? '' }
])

const jsonLd = computed(() => {
  const url = `${siteUrl}${route.path.replace(/\/+$/, '')}`
  // Same form as `localeHomeUrl` in app/app.vue, so `isPartOf` points at the existing WebSite node.
  const localeHome = `${siteUrl}${localePath('/')}`.replace(/\/+$/, '')
  const company = data.value?.item.company
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        'url': url,
        'name': data.value?.detail.title,
        'description': data.value?.detail.description,
        'inLanguage': locale.value,
        'primaryImageOfPage': {
          '@type': 'ImageObject',
          'url': resolveOgImage(siteUrl, ogImagePath.value),
          'width': OG_IMAGE_WIDTH,
          'height': OG_IMAGE_HEIGHT
        },
        'isPartOf': { '@id': `${localeHome}/#website` },
        // Ties the page to the Person entity declared in app.vue; the role itself is the main entity.
        'about': { '@id': `${siteUrl}/#person` },
        'mainEntity': { '@id': `${url}#role` },
        'author': { '@id': `${siteUrl}/#person` }
      },
      {
        '@type': 'Role',
        '@id': `${url}#role`,
        // `position` keeps a trailing "at/na/en" for llms.txt; the role name must not.
        'roleName': data.value?.item.position.replace(/\s+(at|na|en)$/i, ''),
        // The content only has a display string for the period, so no ISO start/end dates are invented here.
        'description': data.value?.item.summary,
        'inLanguage': locale.value,
        'memberOf': { '@type': 'Organization', 'name': company?.name, 'url': company?.url }
      },
      {
        '@type': 'BreadcrumbList',
        // Search engines ignore URL fragments (`/#experience`), so the schema lists Home → this page only; the last
        // name matches the visible crumb (the company).
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': t('experience.breadcrumbHome'), 'item': localeHome },
          { '@type': 'ListItem', 'position': 2, 'name': company?.name ?? data.value?.detail.title, 'item': url }
        ]
      }
    ]
  }
})

useHead(() => ({
  script: [
    {
      key: `experience-${slug.value}-jsonld`,
      type: 'application/ld+json',
      innerHTML: serializeJsonLd(jsonLd.value)
    }
  ]
}))

onMounted(() => track('open_experience_details', { experience: slug.value, surface: 'page' }))
</script>

<template>
  <UPage v-if="data">
    <div
      class="exp-scope"
      :style="accentStyle(data.item.company)"
    >
      <ExperienceProgressBar :overall="spy.overall" />

      <UPageHero
        :title="data.detail.title"
        :description="data.item.summary"
        :ui="{ title: '!mx-0 text-left', description: '!mx-0 text-left' }"
      >
        <template #headline>
          <UBreadcrumb :items="breadcrumbs" />
        </template>
      </UPageHero>

      <UPageSection :ui="{ container: '!pt-0 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10' }">
        <ExperienceTocMobile
          :themes="data.detail.themes"
          :active="spy.active"
        />
        <ExperienceRail
          :themes="data.detail.themes"
          :active="spy.active"
          :segments="spy.segments"
        />
        <div>
          <ExperienceDetail
            :item="data.item"
            :detail="data.detail"
            :show-summary="false"
          />
          <nav
            v-if="data.newer || data.older"
            :aria-label="t('experience.pagination')"
            class="mt-10 flex flex-col gap-3 border-t border-default pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <UButton
              v-if="data.newer"
              :to="localePath(`/experience/${data.newer.slug}`)"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              class="min-w-0 max-w-full"
              :ui="{ label: 'truncate' }"
              :label="t('experience.newerLabel', { company: data.newer.company?.name ?? '' })"
              @click="track('click_experience_nav', { experience: slug, direction: 'newer' })"
            />
            <span v-else />
            <UButton
              v-if="data.older"
              :to="localePath(`/experience/${data.older.slug}`)"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
              class="min-w-0 max-w-full"
              :ui="{ label: 'truncate' }"
              :label="t('experience.olderLabel', { company: data.older.company?.name ?? '' })"
              @click="track('click_experience_nav', { experience: slug, direction: 'older' })"
            />
          </nav>
        </div>
      </UPageSection>
    </div>
  </UPage>
</template>
