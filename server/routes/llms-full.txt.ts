import { queryCollection } from '@nuxt/content/server'

/**
 * `/llms-full.txt`: the full text of each work-experience case study (English content), in the
 * order of the home timeline. Prerendered like `/llms.txt` (see `nitro.prerender.routes`).
 * The selection rules live in `pickCases` (server/utils/llms.ts), which is unit tested.
 */
export default defineEventHandler(async (event) => {
  const { public: { siteUrl } } = useRuntimeConfig(event)

  const details = await queryCollection(event, 'experiences').all()
  const home = await queryCollection(event, 'index').path('/').first()

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return buildLlmsFullTxt({ siteUrl, cases: pickCases(details, home?.experience?.items ?? []) })
})
