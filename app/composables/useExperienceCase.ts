import type { MaybeRefOrGetter } from 'vue'
import type { ExperienceCase } from '~/types/experience'

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

      const [detail, home] = await Promise.all([
        queryCollection('experiences').where('stem', '=', detailStem).first(),
        queryCollection('index').where('stem', '=', homeStem).first()
      ])
      return buildExperienceCase(detail, home?.experience.items ?? [], current)
    },
    options
  )
}
