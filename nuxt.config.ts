// https://nuxt.com/docs/api/configuration/nuxt-config

// Single normalized site URL used by SEO modules (sitemap/robots), i18n `baseUrl`,
// and `runtimeConfig.public.siteUrl`. A production build/generate must never ship the
// `https://example.com` template placeholder: it is always rejected. Resolution order
// is env override → production default domain → localhost (development only).
const PRODUCTION_SITE_URL = 'https://gabrielfaria.dev.br'
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
    'motion-v/nuxt',
    // Real-user Web Vitals; client-only, no-op until enabled in the Vercel dashboard.
    '@vercel/speed-insights/nuxt'
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

  // Generate Nuxt UI themes (and so Tailwind utilities) only for the components the app uses:
  // the 112 theme files otherwise add ~190 KB of unused utilities to the render-blocking entry CSS.
  // List dynamically resolved components here if one loses its styles.
  ui: {
    experimental: {
      componentDetection: true
    }
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

  // Client sourcemaps are opt-in (audit builds only) so production does not
  // publish the source. See docs/performance.md.
  sourcemap: {
    client: process.env.NUXT_SOURCEMAP === 'true',
    server: false
  },

  compatibilityDate: '2024-11-01',

  nitro: {
    prerender: {
      routes: [
        '/',
        '/pt',
        '/es',
        '/llms.txt'
      ],
      crawlLinks: true,
      // The crawler also finds `/pt/` and `/es/`; on Vercel that trailing-slash copy replaces the
      // `/pt` and `/es` static overrides, so the real URLs fall through to the SSR function and 404.
      ignore: [/^\/(pt|es)\/$/]
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

  // Only the faces the site renders: no italic (no <em>/blockquote content), latin subset
  // (all content and UI strings fit in it). 700 stays for Nuxt UI `font-bold` and the mascot bubble.
  // Public Sans's latin file is the only font preloaded; it is a variable file covering 400-700.
  fonts: {
    families: [
      { name: 'Public Sans', weights: [400, 500, 600, 700], styles: ['normal'], subsets: ['latin'], preload: true },
      { name: 'Instrument Serif', weights: [400], styles: ['normal'], subsets: ['latin'], preload: false }
    ]
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
  },

  // Icons never go through api.iconify.design: scanned icons are bundled in the client.
  // `ColorModeButton` builds its name dynamically, so the scan cannot see sun/moon.
  icon: {
    clientBundle: {
      scan: true,
      icons: ['lucide:sun', 'lucide:moon']
    },
    fallbackToApi: false
  },

  // Speaking events are placeholders for now: keep the page out of the sitemap
  // (the page itself sets noindex via `useRobotsRule`). Remove once real events are listed.
  sitemap: {
    exclude: ['/speaking', '/pt/speaking', '/es/speaking']
  }
})
