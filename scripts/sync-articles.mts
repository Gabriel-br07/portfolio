// Refreshes the committed Arandu snapshot: `pnpm sync:articles`.
// Runs on plain Node (type stripping): keep this file and server/utils/arandu.ts free of TS-only syntax.
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { ARTICLE_LOCALES, fetchAranduArticles } from '../server/utils/arandu.ts'
import type { Article } from '../shared/types/article.ts'

// Same default as `runtimeConfig.arandu.feedUrl` in nuxt.config.ts.
const feedUrl = process.env.NUXT_ARANDU_FEED_URL || 'https://dwcorp.com.br/arandu/{lang}/autor/gabriel-faria/feed'

let failed = false

for (const locale of ARTICLE_LOCALES) {
  const file = fileURLToPath(new URL(`../server/assets/articles/${locale}.json`, import.meta.url))
  let articles: Article[]
  try {
    articles = await fetchAranduArticles(locale, feedUrl)
  } catch (error) {
    console.error(`[sync-articles] ${locale}: fetch failed, ${file} left untouched`, error)
    failed = true
    continue
  }

  if (articles.length === 0) {
    console.error(`[sync-articles] ${locale}: feed returned 0 articles, ${file} left untouched`)
    failed = true
    continue
  }

  await writeFile(file, `${JSON.stringify(articles, null, 2)}\n`)
  console.log(`[sync-articles] ${locale}: wrote ${articles.length} articles to ${file}`)
}

if (failed) {
  process.exitCode = 1
}
