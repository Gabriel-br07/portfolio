# 02 — SEO Técnico

## 1. Arquitetura descoberta (Fase A)
| Item | Evidência |
|---|---|
| Framework | Nuxt 4.2.2, Vue 3.5, Vite 7, Nitro 2, pnpm 10 (`CLAUDE.md`, `package.json`) |
| Renderização | Prerender estático (`nitro.prerender` com `/`, `/pt`, `/es`, `/llms.txt`, `crawlLinks`) + ISR 3600s em `/blog*` (`routeRules`) |
| Hospedagem | Vercel (`server: Vercel`, `x-vercel-cache: HIT`) |
| Domínio | `https://gabrielfaria.dev.br` (`nuxt.config.ts` → `PRODUCTION_SITE_URL`) |
| i18n | `@nuxtjs/i18n`, `prefix_except_default`, en (default)/pt/es, `baseUrl = siteUrl` |
| Sitemap | `@nuxtjs/sitemap` 8.2.1; `/sitemap.xml` → 307 → `/sitemap_index.xml` → `/__sitemap__/{en,pt,es}.xml` |
| robots | `@nuxtjs/robots` (gerado); `indexable` só em produção Vercel |
| Metadados | `usePageSeo()` (`app/composables/usePageSeo.ts`), `useLocaleHead` em `app/app.vue` |
| JSON-LD | `app/app.vue` (Person+WebSite), `app/pages/projects.vue:60` (ItemList), `app/pages/blog/index.vue:14` (Blog/BlogPosting) |
| Conteúdo | `content/{,pt/,es/}*.yml` + `projects/*.yml` (Nuxt Content, coleções YAML) |
| Analytics | GA4 pós-consentimento (`app/plugins/gtag.client.ts`), `@vercel/speed-insights` |
| Testes SEO | `tests/seo.test.ts` (ficam em skip sem `.output/`; **não executados**, ver 09) |

## 2. Inventário de páginas indexáveis (15 URLs no sitemap)
| URL (en / pt / es) | Propósito / intenção | Público | Metadata | Indexável |
|---|---|---|---|---|
| `/` `/pt` `/es` | Apresentação, experiência, tecnologias — consulta de marca/perfil | Recrutadores, clientes | `index.vue:27` + `content/index.yml` | Sim |
| `/about` | Biografia e valores | Recrutadores | `about.vue:26` | Sim |
| `/projects` | Lista de 4 projetos (stack, links) | Recrutadores, devs | `projects.vue:37`; JSON-LD ItemList | Sim |
| `/books` | Livros recomendados | Devs | `books.vue:7` (i18n) | Sim |
| `/blog` | Artigos (hospedados externamente no Arandu) | Devs | `blog/index.vue:5`; ISR | Sim |
| `/speaking` (+pt/es) | Palestras (placeholders) | — | `speaking.vue:35` `noindex, nofollow` | **Não** (correto), fora do sitemap, sem links internos |
| `/livros*` | Alias legado | — | 308 → `/books` | Redireciona |

Não existem rotas de detalhe de projeto nem de artigo (artigos vivem em `dwcorp.com.br/arandu`).

## 3. Crawling e indexabilidade (observado em produção, 2026-11-20)
- `robots.txt`: 200, `User-agent: * / Disallow:` (vazio), `Sitemap: …/sitemap_index.xml`. Sintaxe válida.
- Status 200: `/`, `/pt`, `/es`, `/about`, `/projects`, `/books`, `/blog`, `/speaking`, variantes `/pt/…`, `/es/…`. `/livros*` → 308 → `/books` (correto, permanente).
- http→https 308; `www`→apex (307 depois 200); HSTS `max-age=63072000`.
- Meta robots: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` nas indexáveis; `noindex, nofollow` em `/speaking*`.
- Canonical por página igual à própria URL (home sem barra final: `https://gabrielfaria.dev.br`).
- hreflang en/pt/es/x-default nas páginas e no sitemap (idênticos). Em `/blog`, o x-default é `/blog` (= en, coerente).
- Sitemap: 15 URLs (5 por idioma), sem URLs noindex nem redirecionadas. **Sem `lastmod`.**
- Conteúdo no HTML inicial: H1, título, descrição, JSON-LD, 14 `BlogPosting` do blog presentes sem JS (Agente A + conferência da home).
- Cache: HTML `public, max-age=0, must-revalidate` (Vercel HIT); `/_nuxt/*` `immutable` 1 ano.
- Indexação real e cobertura: **Não verificado** (sem Search Console).

## Achados

### SEO-001 — 404 sem `noindex` para requisições `Accept: */*`
> **Correção posterior (2026-11-20):** reverificado com `curl -sI -H 'Accept: text/html'`: o 404 já devolve HTML, `x-robots-tag: noindex, nofollow` e meta robots. O JSON com `X-Robots-Tag: index` ocorre apenas com `Accept: */*` (curl padrão). A severidade original foi superestimada; reclassificada como hardening **P3**. Mitigação implementada em `server/plugins/robots-404.ts` (pendente de validação em build).

- **Categoria:** SEO · **Severidade:** Low · **Prioridade:** P3 · **Confiança:** High
- **Página:** qualquer rota inexistente (`/does-not-exist`, `/pt/nope`)
- **Código:** `app/error.vue:20-30` (define `X-Robots-Tag: noindex, nofollow` + meta robots)
- **Observado:** `HTTP/2 404`, `content-type: application/json`, `x-robots-tag: index, follow, max-image-preview:large…` (verificado por mim com `curl -sI`).
- **Esperado:** 404 com `noindex` (a intenção do código). O status 404 já impede indexação; o header contraditório é ruído.
- **Causa:** provável — o handler de 404 de rota do Nitro/Vercel não passa pelo renderer de erro do Nuxt, e o módulo robots injeta o header. Não investigado.
- **Recomendação:** garantir que erros 404 sejam renderizados por `error.vue` ou definir regra de header para respostas 404 / `routeRules` com `robots: false` para o catch-all.
- **Esforço:** Small · **Validação:** `curl -sI https://…/nao-existe` deve mostrar `noindex` e `text/html`.
- **Ref.:** https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag

### SEO-002 — Variantes duplicadas servidas com 200
- **Severidade:** Low · **P3** · **Confiança:** Medium (Agente A; `/pt/` e `/es/` canonical → sem barra, conferido)
- **Observado:** `/pt/`, `/es/` (200, canonical correto), `/index.html` (200), `/robots.txt/` e `/sitemap.xml/` (200 `text/html`, `X-Robots-Tag: index`, sem canonical).
- **Impacto:** mínimo; canonical resolve as páginas. `/robots.txt/` e `/sitemap.xml/` não são URLs úteis.
- **Recomendação:** redirect de barra final (`routeRules`/`vercel` `trailingSlash`) se quiser eliminar; opcional.
- **Esforço:** Small · **Validação:** `curl -sI` nas variantes.

### SEO-003 — Sitemap sem `lastmod`
- **Severidade:** Low · **P3** · **Confiança:** High (0 ocorrências em `en.xml`).
- **Recomendação:** só adicionar se for **preciso** (data real de modificação do conteúdo). `lastmod` impreciso é pior que ausente. Fonte possível: datas dos YAML/commit.
- **Ref.:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

### Informativos (sem finding)
- `/sitemap.xml` faz 307 para `/sitemap_index.xml`; `robots.txt` já aponta direto para o índice. Sem impacto.
- `/speaking` é órfã (sem links em `app/` ou `content/`) e `noindex`: sem impacto de indexação; ver AEO-008.
- Terceiros no HTML: apenas links/imagens (dwcorp, github, linkedin, obycapital, serpro); nenhum script de terceiro no HTML bruto. GA4 carregado após consentimento.
- `og-image.jpeg` com `max-age=0` (performance, ver 06).
- Não verificado: barra final em `/livros/`, `/es/livros`; renderização com JS (sem browser headless).

## Internacionalização
Coerente: en/pt/es com título/descrição/`og:locale` por idioma, hreflang bidirecional e x-default. `detectBrowserLanguage` com `redirectOn: 'root'` e cookie; `Accept-Language: pt-BR` em `/` **não** redirecionou (200) — bom para crawlers. Conteúdo traduzido de fato (não apenas shell), com pequenas divergências (AEO-010).
