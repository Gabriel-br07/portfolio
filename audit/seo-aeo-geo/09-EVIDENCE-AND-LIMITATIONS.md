# 09 — Evidências e Limitações

## Pontuação (rubrica transparente; não é ranking nem probabilidade de citação)
Critérios inspecionados atendidos / avaliados (sem score combinado):
| Categoria | Resultado | Critérios |
|---|---|---|
| SEO técnico | 11/14 | Atendidos: status, robots, meta robots, canonical, hreflang, sitemap sem noindex, HTTPS, www, HTML inicial, i18n, redirects legados. Falhas leves: 404 só com `Accept: */*` (SEO-001, P3), duplicatas (002), lastmod (003) |
| SEO on-page/conteúdo | 6/9 | Títulos/descrições únicos e localizados, H1 único, alt; falhas: headings (006), cargo na hero (003), meta vs. texto |
| AEO | 5/10 perguntas com resposta explícita e fácil de achar | Ver matriz em 03 (contato e resultados fracos) |
| GEO (prontidão técnica) | N/A numérico | Acesso de crawlers OK; entidade consistente; citabilidade baixa; impacto em citações **não mensurável** |
| Credibilidade profissional | Qualitativo: média | Sem métricas, CV, case studies; speaking placeholder |
| Performance/Acessibilidade | **N/A** | Sem Lighthouse/CWV; só sinais de config |

## Comandos executados
- `curl -s -o /dev/null -w "%{http_code} %{redirect_url}"` em `/`, `/pt`, `/es`, `/about`, `/projects`, `/books`, `/blog`, `/speaking`, `/livros`, `/pt/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`
- `curl -s` de `/robots.txt`, `/sitemap_index.xml`, `/__sitemap__/{en,pt,es}.xml`, `/` (meta/JSON-LD), `/llms.txt`
- `curl -sI` em `/`, `/does-not-exist`; `curl -s | grep -c mailto:` em `/`, `/about`, `/projects`, `/pt`
- `grep` em `content/**/projects/Curupira.yml`, `llms.txt.ts`, `Hero.vue`, `app/**` (links para `/speaking`)
- Agentes A/B/C: `curl -sIL` em ~20 URLs, `curl -A` com UAs de bots, leitura de `content/**`, `i18n/`, `app/**`, HTML de 17 URLs (copiados em `…/scratchpad/`, fora do repo)
- `pnpm test` **não executou** (`pnpm: comando não encontrado`).

## Fontes inspecionadas
`nuxt.config.ts`, `app/app.vue`, `app/app.config.ts`, `app/composables/usePageSeo.ts`, `app/error.vue`, `app/pages/{index,about,projects,books,speaking}.vue`, `app/pages/blog/index.vue`, `app/components/landing/{Hero,TechCarousel,FAQ,Testimonials}.vue`, `ContactModal.vue`, `server/routes/llms.txt.ts`, `content/**`, `i18n/locales/*.json`, `tests/seo.test.ts`, `.claude/skills/seo-audit/SKILL.md`.

## Referências oficiais (lidas via subagente `web-fetch`/Agente C em 2026-11-20; nenhuma exibia data de atualização exceto onde indicado)
Google: ai-optimization-guide, ai-features, profile-page · Bing: blog "AI Performance" (2026-02-10) · web.dev/vitals (atualizado 2024-10-31) · OpenAI bots · Anthropic support 8896518. Não relidos: Google SEO starter guide, JS SEO basics, build-sitemap (citados de conhecimento; marcar como não relidos nesta sessão).

## Disponível
Produção via curl; repositório; WebSearch/WebFetch (via subagentes).

## Indisponível / Não verificado
Search Console, Bing Webmaster, GA4 (dados), Vercel dashboard (WAF, Speed Insights, env vars); Lighthouse/CWV (sem Chrome); Rich Results Test; renderização com JS/browser; contraste e teclado; `tests/seo.test.ts` (sem pnpm/`.output`); funcionamento do formulário Web3Forms; veracidade das palestras e da experiência (sem fonte externa); status ao vivo de LinkedIn/GitHub; **benchmark competitivo (seção 11 do pedido) não realizado**; visibilidade em IA (nenhuma consulta a ChatGPT/Perplexity/Claude feita); causa do 404 JSON (mitigado por plugin Nitro; não validado em produção Vercel).

## Premissas
Produção = `gabrielfaria.dev.br` (config do repo; robots em modo `indexable` confirma). Achados dos subagentes marcados "confiança média" não foram integralmente reconferidos (AEO-003/004/005/006). Achados reconferidos por mim: AEO-001, AEO-010 (Curupira), GEO-002, SEO-001, hero.links, robots/sitemap/JSON-LD/llms.txt da home.

## Integridade
Nenhum arquivo da aplicação foi alterado; única escrita: `audit/seo-aeo-geo/`. Sem commits, PRs ou issues remotas. `audit/` está fora de `app/`, `content/`, `public/` (não entra no build).
