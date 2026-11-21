# 01 — Resumo Executivo: Auditoria SEO / AEO / GEO

- **Site:** https://gabrielfaria.dev.br (Nuxt 4.2, SSG/prerender + ISR em `/blog`, Vercel)
- **Data:** 2026-11-20 · **Escopo:** somente leitura; nenhum arquivo da aplicação foi alterado.
- **Método:** inspeção do repositório, `curl` em produção, 3 investigações paralelas (Haiku), verificação dos achados críticos pelo orquestrador (Sonnet). Detalhes e limites em `09-EVIDENCE-AND-LIMITATIONS.md`.

## Avaliação geral

A base técnica é **sólida e acima da média para um portfólio**: HTML completo no response inicial (SSG), canonical/hreflang/x-default coerentes entre en/pt/es e idênticos ao sitemap, `robots.txt` permissivo e correto, `noindex` aplicado só ao que deve (`/speaking`), JSON-LD (Person, WebSite, ItemList, Blog) no HTML bruto, redirects HTTPS/www corretos. **Não há bloqueadores de descoberta (nenhum P0).**

O ponto fraco não é técnico, é de **conteúdo e prova de trabalho**: um modelo de IA ou recrutador que leia só o HTML publicado consegue dizer *quem* é o dev e *o que* ele construiu, mas **não consegue achar como contatá-lo**, não encontra problema/decisão/resultado de nenhum projeto e não tem páginas próprias para citar.

## Pontos fortes (verificados)
1. Renderização estática: título, H1, descrição, links e JSON-LD presentes no HTML bruto.
2. i18n correto: `html lang`, canonical por idioma, hreflang + x-default, sitemap por idioma (15 URLs).
3. Política de crawlers coerente: tudo liberado, sem regras por bot, sem diferença de resposta por User-Agent (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot → todos 200).
4. Ambientes de preview protegidos por `noindex`/`Disallow` (config; produção observada `indexable`).
5. Entidade consistente: nome, cargo localizado, `sameAs` (GitHub/LinkedIn) coerentes nos 3 idiomas.

## Fragilidades principais
1. **Contato inexistente no HTML estático** (0 `mailto:` em `/`, `/about`, `/projects`, `/pt`; formulário só via JS; e-mail apenas no JSON-LD). → AEO-001
2. **Projetos sem URL própria nem estrutura problema → decisão → resultado.** → AEO-002
3. **Bug de dados no `/llms.txt`** ("Stack: ." do LabTech) e URL do Curupira divergente entre idiomas. → GEO-002, AEO-010
4. ~~404 com `X-Robots-Tag: index`~~ — só ocorre com `Accept: */*`; com `text/html` o 404 já é `noindex`. Rebaixado a hardening P3. → SEO-001
5. Carrossel de 31 tecnologias sem evidência correspondente em projetos/experiência; cargo ausente do texto visível da hero (confiança média). → AEO-003/004

## Top 5 ações recomendadas
| # | Ação | Prioridade |
|---|---|---|
| 1 | Expor contato (mailto/link de agenda) no HTML estático do rodapé e de `/about`; incluir contato no `llms.txt` | P1 |
| 2 | Corrigir `llms.txt` (guarda para `tags` vazias) e padronizar URL do Curupira | P2 (esforço Small) |
| 3 | Dar a cada projeto um bloco/URL com Problema · Contribuição · Decisões · Resultado, **apenas com fatos do autor** | P2 |
| 4 | Alinhar cargo visível na hero com o do `<title>`/JSON-LD; reduzir/rotular o carrossel de techs | P2 |
| 5 | Corrigir resposta 404 (noindex real) e medir: Search Console, Bing Webmaster (AI Performance), Lighthouse, logs por UA | P2/P3 |

## Incertezas importantes
- **Indexação real não verificada** (sem acesso ao Search Console / Bing Webmaster). HTTP 200 ≠ indexado.
- **Core Web Vitals e Lighthouse não medidos** (sem Chrome/Lighthouse no ambiente; sem dados de campo).
- WAF/Bot rules da Vercel não verificáveis sem dashboard; testamos só respostas por UA.
- Benchmark competitivo **não realizado** (ver 09).
- GA4/Speed Insights ativos em produção: não verificado.
- Uma busca web por nome não retornou o site: observação única, fraca, não conclusiva.

## Benefícios esperados (qualificados)
Corrigir contato, projetos e `llms.txt` torna o conteúdo **mais legível e extraível** por recrutadores e sistemas de IA. Não há evidência oficial de que isso aumente ranking ou citações; o Google afirma não haver requisitos extras para AI Overviews/AI Mode além de indexação e snippet elegível, e que `llms.txt` não é usado pela Busca.
