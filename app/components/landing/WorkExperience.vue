<script setup lang="ts">
import { computed } from 'vue'
import type { IndexCollectionItem } from '@nuxt/content'
import type { ExperienceItem } from '~/types/experience'

type IndexPageWithExperience = IndexCollectionItem & {
  experience: { title: string, items: ExperienceItem[] }
}

const props = defineProps<{
  page: IndexPageWithExperience
}>()

const items = computed(() => props.page.experience.items)
</script>

<template>
  <UPageSection
    :title="page.experience.title"
    :ui="{
      container: '!p-0 gap-4 sm:gap-4',
      title: 'text-left text-xl sm:text-xl lg:text-2xl font-medium',
      description: 'mt-2'
    }"
  >
    <template #description>
      <div class="flex flex-col gap-0">
        <div
          v-for="(experience, index) in items"
          :key="index"
          class="experience-enter text-muted flex items-center text-nowrap gap-2"
          :style="{ '--experience-delay': `${0.4 + 0.2 * Number(index)}s` }"
        >
          <p class="text-sm">
            {{ experience.date }}
          </p>
          <USeparator />

          <template v-if="experience.company && experience.company.url">
            <ULink
              class="flex items-center gap-3"
              :to="experience.company.url"
              target="_blank"
            >
              <span class="text-sm font-normal">{{ experience.position }}</span>
              <LandingExperienceCompanyLogo
                :experience="experience"
                variant="link"
              />
            </ULink>
          </template>

          <template v-else>
            <div class="flex items-center gap-3">
              <span class="text-sm font-normal">{{ experience.position }}</span>
              <LandingExperienceCompanyLogo
                :experience="experience"
                variant="plain"
              />
            </div>
          </template>
        </div>
      </div>
    </template>
  </UPageSection>
</template>
