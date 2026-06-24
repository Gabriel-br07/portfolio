// https://nuxt.com/docs/api/configuration/nuxt-config

// Single normalized site URL used by SEO modules (sitemap/robots), i18n `baseUrl`,
// and `runtimeConfig.public.siteUrl`. A production build/generate must never ship the
// `https://example.com` template placeholder: it is always rejected. Resolution order
// is env override → production default domain → localhost (development only).
const PRODUCTION_SITE_URL = 'https://gabriel07.vercel.app'
const PLACEHOLDER_SITE_URL = 'https://example.com'
const rawSiteUrl = process.env.NUXT_PUBLIC_SITE_URL?.trim()

function resolveSiteUrl(): string {
  if (rawSiteUrl && rawSiteUrl !== PLACEHOLDER_SITE_URL) {
    return rawSiteUrl.replace(/\/+$/, '')
  }
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_SITE_URL
  }
  // Development-only convenience fallback.
  return 'http://localhost:3000'
}

const siteUrl = resolveSiteUrl()

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@vueuse/nuxt',
    'motion-v/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Single source of truth for Nuxt SEO modules (sitemap, robots).
  site: {
    url: siteUrl,
    name: 'Gabriel Oliveira Portfolio'
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },
  runtimeConfig: {
    public: {
      siteUrl,
      web3formsAccessKey: process.env.NUXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? ''
    }
  },

  routeRules: {
    '/livros': { redirect: { to: '/books', statusCode: 308 } },
    '/livros/': { redirect: { to: '/books', statusCode: 308 } },
    '/pt/livros': { redirect: { to: '/pt/books', statusCode: 308 } },
    '/pt/livros/': { redirect: { to: '/pt/books', statusCode: 308 } },
    '/es/livros': { redirect: { to: '/es/books', statusCode: 308 } },
    '/es/livros/': { redirect: { to: '/es/books', statusCode: 308 } }
  },

  compatibilityDate: '2024-11-01',

  nitro: {
    prerender: {
      routes: [
        '/',
        '/pt',
        '/es'
      ],
      crawlLinks: true
    }
  },

  // Dev: first SSR transform of large graphs (Tailwind, Nuxt UI, etc.) can exceed 60s on Windows — see nuxt/nuxt#32789
  vite: {
    viteNode: {
      requestTimeout: 120000
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  i18n: {
    baseUrl: siteUrl,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    // Resolved under `restructureDir` (default `i18n/`) → `i18n/locales/*.json`
    langDir: 'locales',
    locales: [
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'pt', language: 'pt', name: 'Português', file: 'pt.json' },
      { code: 'es', language: 'es', name: 'Español', file: 'es.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
