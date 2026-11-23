import type { IndexCollectionItem } from '@nuxt/content'
import type { MaybeRefOrGetter } from 'vue'
import type { ExperienceCaseDetail, ExperienceItem } from '~/types/experience'

type IndexWithExperience = IndexCollectionItem & {
  experience: { title: string, items: ExperienceItem[] }
}

export interface ExperienceCase {
  item: ExperienceItem
  detail: ExperienceCaseDetail
  newer: ExperienceItem | null
  older: ExperienceItem | null
}

/** Case-study data for one role: short item from `index`, long detail from `experiences`, plus neighbours. */
export function useExperienceCase(slug: MaybeRefOrGetter<string>, options: { lazy?: boolean, server?: boolean } = {}) {
  const { locale, defaultLocale } = useI18n()
  const localePath = useLocalePath()

  return useAsyncData<ExperienceCase | null>(
    () => `experience-${toValue(slug)}-${locale.value}`,
    async () => {
      const current = toValue(slug)
      const detailStem = experienceStem(locale.value, defaultLocale, current)
      const homeStem = indexCollectionStem(localePath('/'))

      const [detail, homeEntry] = await Promise.all([
        queryCollection('experiences').where('stem', '=', detailStem).first(),
        queryCollection('index').where('stem', '=', homeStem).first()
      ])
      const home = homeEntry as IndexWithExperience | null
      const items = home?.experience.items ?? []
      const item = items.find(i => i.slug === current)
      if (!detail || !item) return null

      return {
        item,
        detail: detail as unknown as ExperienceCaseDetail,
        ...adjacentExperiences(items, current)
      }
    },
    options
  )
}
