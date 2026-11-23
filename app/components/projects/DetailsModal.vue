<script setup lang="ts">
import type { ProjectCollectionItem } from '~/composables/useProjectsCollection'

const props = defineProps<{
  project: ProjectCollectionItem
}>()

const { t } = useI18n()
const { track } = useAnalytics()

const open = ref(false)

watch(open, (isOpen) => {
  if (isOpen) track('open_project_details', { project: props.project.title })
})
</script>

<template>
  <!-- Teleported to <body> by Nuxt UI, so it never grows or shifts the project card. -->
  <UModal
    v-model:open="open"
    :title="project.title"
    :description="t('projects.detailsTitle')"
    scrollable
  >
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      icon="i-lucide-info"
      aria-haspopup="dialog"
      @click.stop
    >
      {{ t('projects.viewDetails') }}
    </UButton>

    <template #close="{ ui }">
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        data-slot="close"
        :aria-label="t('projects.close')"
        :class="ui.close()"
      />
    </template>

    <template #body>
      <dl class="space-y-4 text-sm leading-relaxed">
        <div v-if="project.problem">
          <dt class="font-semibold text-highlighted">
            {{ t('projects.context') }}
          </dt>
          <dd class="text-default">
            {{ project.problem }}
          </dd>
        </div>
        <div v-if="project.role">
          <dt class="font-semibold text-highlighted">
            {{ t('projects.role') }}
          </dt>
          <dd class="text-default">
            {{ project.role }}
          </dd>
        </div>
        <div v-if="project.decisions?.length">
          <dt class="font-semibold text-highlighted">
            {{ t('projects.decisions') }}
          </dt>
          <dd>
            <ul class="list-disc space-y-1 pl-5 text-default">
              <li
                v-for="decision in project.decisions"
                :key="decision"
              >
                {{ decision }}
              </li>
            </ul>
          </dd>
        </div>
        <div v-if="project.outcome">
          <dt class="font-semibold text-highlighted">
            {{ t('projects.outcome') }}
          </dt>
          <dd class="text-default">
            {{ project.outcome }}
          </dd>
        </div>
        <div v-if="project.tags?.length">
          <dt class="font-semibold text-highlighted">
            {{ t('projects.stack') }}
          </dt>
          <dd class="mt-1">
            <TechTagList
              class="exp-scope exp-scope--primary"
              :tags="project.tags"
              :show-icons="false"
            />
          </dd>
        </div>
      </dl>
    </template>
  </UModal>
</template>
