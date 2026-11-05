# SEO técnico: sitemap, hreflang, canonical e robots

Domínio canônico: `https://gabrielfaria.dev.br` (`PRODUCTION_SITE_URL` em `nuxt.config.ts`; sobrescrito por `NUXT_PUBLIC_SITE_URL`).
**URL para enviar ao Google Search Console:** `https://gabrielfaria.dev.br/sitemap_index.xml` (`/sitemap.xml` redireciona para ela).

## Como é gerado

| Item | Quem gera | Onde configurar |
|---|---|---|
| Sitemap | `@nuxtjs/sitemap`, um arquivo por idioma (`/__sitemap__/{en,pt,es}.xml`) listado em `sitemap_index.xml` | `sitemap` em `nuxt.config.ts` |
| hreflang + `x-default` | `useLocaleHead()` em `app/app.vue` (HTML) e o módulo de sitemap (`xhtml:link`) | `i18n.locales` |
| canonical | `useLocaleHead()` (`baseUrl` = site URL), sem barra final | `i18n.baseUrl` |
| `og:*` / `twitter:*` / `og:locale` | `usePageSeo()` (`app/composables/usePageSeo.ts`); mapa `OG_LOCALES` | chaves `seo*` em `i18n/locales/*.json` |
| robots.txt | `@nuxtjs/robots` (rota dinâmica, não há arquivo em `public/`) | `site.indexable` |
| JSON-LD | `app/app.vue` (Person + WebSite por idioma), `projects.vue`, `blog/index.vue` | |

Não existe `lastmod`, `priority` nem `changefreq`: o conteúdo não tem uma data real de alteração e o Google ignora os dois últimos. Se uma coleção ganhar um campo `updatedAt`, informe-o em `sitemap.sources`.

## Rotas e idiomas

Idiomas: `en` (padrão, sem prefixo), `pt`, `es`. Páginas indexáveis: `/`, `/about`, `/projects`, `/books`, `/blog` em cada idioma (15 URLs, ex.: `/`, `/pt/books`, `/es/about`).
Fora do sitemap: `/speaking` (noindex), `/livros*` (redirecionam 308 para `/books`) e páginas de erro (noindex, sem canonical).

## Como novas páginas entram

Qualquer arquivo novo em `app/pages/` que seja prerenderizado ou alcançável por link (`crawlLinks`) entra no sitemap nos três idiomas. Para tirar uma página: `useRobotsRule('noindex, nofollow')` na página **e** `sitemap.exclude`. Hoje não há rotas dinâmicas; os artigos do blog são links externos para o Arandu e não pertencem a este sitemap.

## Traduções ausentes

As relações hreflang vêm do próprio i18n: uma página só tem alternates dos idiomas em que existe. Não crie conteúdo em outro idioma copiando o original; sem tradução, não publique a rota naquele idioma.

## Ambientes

`site.indexable` é `true` apenas em produção (`VERCEL_ENV=production`, ou `NODE_ENV=production` fora da Vercel). Previews recebem `Disallow: /` no robots.txt. Observação: os HTMLs prerenderizados ainda carregam a meta `index` e são servidos pela CDN, então confie no `robots.txt` e na proteção de deploys da Vercel para previews, não na meta.
Um build com `VERCEL_ENV` definido usa o preset Vercel e grava em `.vercel/output`, não em `.output`.

## Como testar

Local:

```bash
NUXT_PUBLIC_SITE_URL=https://gabrielfaria.dev.br pnpm build
pnpm test            # inclui tests/seo.test.ts (sitemap, hreflang, canonical, robots meta)
NODE_ENV=production node .output/server/index.mjs
curl -s localhost:3000/robots.txt
curl -s localhost:3000/sitemap_index.xml
curl -s localhost:3000/pt/books | grep -E 'canonical|alternate|og:'
```

`tests/seo.test.ts` pula sozinho se não houver build. Em produção, repita os `curl` contra o domínio e valide o JSON-LD no Rich Results Test (`https://search.google.com/test/rich-results`).

## Google Search Console

1. **Propriedade:** adicione `gabrielfaria.dev.br` (propriedade de domínio, via registro DNS TXT) ou o prefixo `https://gabrielfaria.dev.br/`. A meta `google-site-verification` já está em `app/app.vue` e cobre a propriedade de prefixo de URL.
2. Abra **Sitemaps** no menu lateral.
3. Em "Adicionar um novo sitemap", informe `sitemap_index.xml` e envie.
4. Confira a linha do sitemap: status "Sucesso", data da última leitura e número de páginas descobertas (esperado: 15). Erros aparecem ao clicar nela.
5. Em **Inspeção de URL**, inspecione `/`, `/pt` e `/es` (e uma página interna por idioma). Verifique "Canonical declarado pelo usuário" = "Canonical selecionado pelo Google" e, se necessário, **Solicitar indexação**.
6. Em **Indexação > Páginas**, veja quantas URLs estão indexadas e a lista de motivos para as não indexadas.
7. Investigue cada motivo: "Rastreada, mas não indexada no momento" e "Descoberta, mas não indexada" indicam fila ou baixa prioridade, não erro; "Página alternativa com tag canônica adequada" e "Redirecionamento" são esperados para `/livros`; "Excluída pela tag noindex" é esperado só para `/speaking`.
8. Após cada deploy, acompanhe o relatório por alguns dias. Enviar o sitemap ajuda na descoberta, mas **não garante** que todas as páginas serão indexadas, nem quando.
