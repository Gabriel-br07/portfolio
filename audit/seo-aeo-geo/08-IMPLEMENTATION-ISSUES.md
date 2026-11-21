# 08 — Issues Sugeridas (NÃO criadas no GitHub)

Pequenas, coesas e testáveis de forma independente. Formato: Título · Problema · Escopo · Código · Critérios · Testes · Dependências · Entregável · Esforço.

## ISSUE-1 — Expor contato no HTML estático
- **Problema:** 0 `mailto:`/link de agenda no HTML de `/`, `/about`, `/projects` (AEO-001).
- **Escopo:** link de contato em texto no rodapé e em `/about`; sem alterar o modal.
- **Código:** `app/components/AppFooter.vue`, `app/pages/about.vue`, `app/app.config.ts`, i18n en/pt/es.
- **Aceite:** HTML prerenderizado contém o link em 3 idiomas; textos via `t()`; analytics de clique preservado (`useAnalytics`).
- **Testes:** teste vitest sobre HTML/`.output` ou `curl | grep`; `pnpm lint`, `pnpm typecheck`.
- **Depende de:** decisão do autor sobre expor e-mail. · **Entregável:** PR. · **Esforço:** Small.

## ISSUE-2 — Corrigir `llms.txt` (tags vazias, experiência, contato)
- **Problema:** "Stack: ." no LabTech; experiência hardcoded (GEO-002).
- **Código:** `server/routes/llms.txt.ts:49,54-55`, `content/projects/LabTech.yml`.
- **Aceite:** sem "Stack: ." quando `tags` vazio; experiência derivada de `content/index.yml`; linha de contato.
- **Testes:** unit test do gerador (função pura extraída), `curl /llms.txt`. · **Dep.:** ISSUE-1 (contato). · **Esforço:** Small.

## ISSUE-3 — Consistência de conteúdo entre idiomas
- **Problema:** URL do Curupira, título da palestra, grafia do cargo (AEO-010).
- **Código:** `content/{pt,es}/projects/Curupira.yml`, `content/*/speaking.yml`, `content/*/index.yml`.
- **Aceite:** mesma URL e título equivalente nos 3 idiomas; grafia única do cargo.
- **Testes:** teste que compara `url` entre locales das coleções. · **Esforço:** Small.

## ISSUE-4 — 404 com `noindex` e HTML
- **Problema:** 404 JSON com `X-Robots-Tag: index` apenas para `Accept: */*` (SEO-001, rebaixado a P3: com `text/html` o 404 já é `noindex`).
- **Status:** implementado em `server/plugins/robots-404.ts` (hook `error` do Nitro); verificado localmente para `*/*` e `text/html`.
- **Código:** `app/error.vue:20-30`, `nuxt.config.ts` (`routeRules`/`nitro`).
- **Aceite:** `curl -sI /rota-inexistente` → 404, `x-robots-tag: noindex`, `text/html`.
- **Testes:** teste em `tests/seo.test.ts` (contra preview). · **Esforço:** Small (investigar causa).

## ISSUE-5 — Cargo visível na hero e revisão do carrossel
- **Problema:** AEO-003/004. **Código:** `Hero.vue`, `content/index.yml`, `TechCarousel.vue`.
- **Aceite:** cargo no texto visível igual ao `<title>`; carrossel só com techs comprováveis ou rótulo adequado.
- **Testes:** snapshot/grep do HTML. · **Dep.:** decisão do autor. · **Esforço:** Small.

## ISSUE-6 — Estrutura de case study por projeto
- **Problema:** AEO-002. **Código:** `content.config.ts`, `content/**/projects/*.yml`, `app/pages/projects.vue`, `ProjectsPageCard.vue`.
- **Aceite:** campos opcionais `problem/role/decisions/outcome` renderizados com headings; só conteúdo real; sem métricas inventadas.
- **Testes:** teste de schema; HTML bruto contém blocos; typecheck. · **Dep.:** autor fornece texto. · **Esforço:** Medium.

## ISSUE-7 — Headings e acessibilidade de links
- **Problema:** AEO-006. **Código:** `about.vue`, `books.vue`, `BookCard`, `ProjectsPageCard.vue`.
- **Aceite:** sem salto H1→H3; um link por card ou textos distintos.
- **Testes:** script de outline de headings. · **Esforço:** Small.

## ISSUE-8 — Lighthouse/Speed Insights e cache da OG image
- **Problema:** PERF-001/002. **Aceite:** relatórios mobile e desktop em `audit/`; Speed Insights ativo; cache longo da OG. **Esforço:** Small.

## ISSUE-9 — JSON-LD: `ProfilePage` e `author`
- **Problema:** STRUCT/GEO-003/004. **Código:** `app/app.vue`, `about.vue`, `projects.vue`.
- **Aceite:** `ProfilePage` com `mainEntity` `#person` em `/about`; `author` no ItemList; decisão sobre e-mail; `sameAs` com Arandu.
- **Testes:** JSON-LD parse em teste; Rich Results Test manual. · **Dep.:** ISSUE-1. · **Esforço:** Small.

## ISSUE-10 — Mensuração
- **Aceite (operacional):** propriedade verificada no Search Console e Bing Webmaster; sitemap enviado; documento com procedimento de logs por UA e GA4 por referrer de IA. **Esforço:** Small.
