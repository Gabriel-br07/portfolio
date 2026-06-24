// https://nuxt.com/docs/api/configuration/nuxt-config
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

  // Single source of truth for NuxtSEO modules (sitemap, robots, og-image).
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    name: 'Gabriel Oliveira Portfolio'
  },
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
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
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
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
