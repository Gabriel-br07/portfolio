<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data: page } = await useAsyncData(
  () => `projects-page-${locale.value}`,
  async () => {
    for (const p of contentPathVariants(localePath('/projects'), route.path)) {
      const doc = await queryCollection('pages').path(p).first()
      if (doc) return doc
    }
    // Fallback: page-type paths can miss `.path()` lookup; YAML stem matches locale folder (e.g. `projects`, `pt/projects`).
    const stem = localePath('/projects').replace(/^\/+|\/+$/g, '')
    const all = await queryCollection('pages').all()
    return all.find(item => (item as { stem?: string }).stem === stem) ?? null
  }
)
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true
  })
}

const { data: projects } = await useAsyncData(
  () => `projects-${locale.value}`,
  async () => {
    const all = await queryCollection('projects').all()
    // Data collections expose `stem` (file path without ext), not `path` like page collections.
    const stemPrefix = localePath('/projects').replace(/^\/+|\/+$/g, '')
    const filtered = all.filter((item) => {
      const stem = (item as { stem?: string }).stem ?? ''
      return stem.startsWith(`${stemPrefix}/`)
    })
    return filtered.sort((a, b) => {
      const da = new Date((a as { date: string | Date }).date).getTime()
      const db = new Date((b as { date: string | Date }).date).getTime()
      return db - da
    })
  }
)

const { global } = useAppConfig()

useSeoMeta({
  title: page.value?.seo?.title || page.value?.title,
  ogTitle: page.value?.seo?.title || page.value?.title,
  description: page.value?.seo?.description || page.value?.description,
  ogDescription: page.value?.seo?.description || page.value?.description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
      :links="page.links"
      :ui="{
        title: '!mx-0 text-left',
        description: '!mx-0 text-left',
        links: 'justify-start'
      }"
    >
      <template #links>
        <div
          v-if="page.links"
          class="flex items-center gap-2"
        >
          <UButton
            :label="page.links[0]?.label"
            :to="global.meetingLink"
            v-bind="page.links[0]"
          />
          <UButton
            :to="`mailto:${global.email}`"
            v-bind="page.links[1]"
          />
        </div>
      </template>
    </UPageHero>
    <UPageSection
      :ui="{
        container: '!pt-0'
      }"
    >
      <Motion
        v-for="(project, index) in projects"
        :key="project.title"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.2 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageCard
          :title="project.title"
          :to="project.url"
          orientation="horizontal"
          variant="naked"
          :reverse="index % 2 === 1"
          class="group"
          :ui="{
            wrapper: 'max-sm:order-last'
          }"
        >
          <template #leading>
            <span class="text-sm text-muted">
              {{ new Date(project.date).getFullYear() }}
            </span>
          </template>
          <template #description>
            <p>{{ project.description }}</p>
            <div
              v-if="project.tags?.length"
              class="flex flex-wrap gap-1.5 mt-2"
            >
              <UBadge
                v-for="tag in project.tags"
                :key="`${project.title}-${tag}`"
                variant="subtle"
                size="sm"
                color="neutral"
              >
                {{ tag }}
              </UBadge>
            </div>
          </template>
          <template #footer>
            <ULink
              :to="project.url"
              class="text-sm text-primary flex items-center"
            >
              {{ t('locale.viewProject') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-4 text-primary transition-all opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
              />
            </ULink>
          </template>
          <img
            :src="project.image"
            :alt="project.title"
            class="object-cover w-full h-48 rounded-lg"
          >
        </UPageCard>
      </Motion>
    </UPageSection>
  </UPage>
</template>
