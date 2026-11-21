# 07 — Roadmap Priorizado

Nenhum item P0. Sequência pensada para minimizar retrabalho: primeiro dados/contato (afetam todo o resto), depois conteúdo de projetos, depois schema/experimentos.

## Fase 1 — Correções essenciais
| ID | Categoria | Prioridade | Arquivo/página | Mudança | Esforço | Validação |
|---|---|---|---|---|---|---|
| AEO-001 | AEO | P1 | `AppFooter.vue`, `about.vue`, `app.config.ts` | Contato em texto (mailto/agenda) no HTML estático | Small | `curl … \| grep -c mailto:` > 0 |
| GEO-002 | GEO | P2 | `server/routes/llms.txt.ts`, `LabTech.yml` | Guarda p/ tags vazias; remover "Stack: ."; contato | Small | `curl /llms.txt` sem `Stack: .` |
| AEO-010 | Content | P2 | `content/{pt,es}/projects/Curupira.yml` | Padronizar URL do Curupira; alinhar título da palestra e grafia do cargo | Small | grep nos YAML |
| SEO-001 | SEO | P3 (rebaixado: só `Accept: */*`) | `app/error.vue`, `nuxt.config.ts` | 404 com `noindex` e HTML | Small | `curl -sI /x` → `noindex` |

## Fase 2 — Alto impacto
| ID | Categoria | Prioridade | Arquivo/página | Mudança | Esforço | Validação |
|---|---|---|---|---|---|---|
| AEO-003 | AEO | P2 | `Hero.vue`, `content/index.yml` | Cargo visível na hero (mesma string do SEO) | Small | HTML bruto contém cargo |
| AEO-004 | Content | P2 | `TechCarousel.vue` | Reduzir/rotular techs sem evidência (decisão do autor) | Small | Revisão de conteúdo |
| AEO-002 | AEO | P2 | `content.config.ts`, `projects.vue`, `content/projects/*` | Campos problema/contribuição/decisões/resultado; âncoras ou `[slug]` | Medium | HTML bruto contém blocos |
| PERF-001 | Perf | P2 | — | Lighthouse mobile/desktop; habilitar Speed Insights | Small | Relatórios JSON |
| AEO-008 | Content | P2 | `speaking.yml` | Confirmar eventos reais ou manter noindex/órfã | Small | Revisão |

## Fase 3 — AEO/GEO
| ID | Categoria | Prioridade | Arquivo/página | Mudança | Esforço | Validação |
|---|---|---|---|---|---|---|
| AEO-006 | AEO | P3 | `about.vue`, `books.vue`, `ProjectsPageCard` | Headings H2/H3 corretos | Small | Outline de headings |
| AEO-005 | AEO | P3 | `books.vue`, `recommended-books.ts` | Resenha no DOM; alts localizados | Small | grep no HTML |
| GEO-004 | GEO | P3 | `app/app.vue` | `sameAs` incluir perfil Arandu | Small | JSON-LD |
| STRUCT | SEO | P3 | `about.vue`, `projects.vue` | `ProfilePage` em `/about`; `author` no ItemList | Small | Rich Results Test |
| GEO-003 | GEO | P3 | `app/app.vue` | Decidir sobre e-mail no JSON-LD | Small | JSON-LD |
| AEO-009 | Content | P3 | `public/`, rodapé | Link de CV (opcional) | Small | Link 200 |

## Fase 4 — Experimentos / mensuração
| ID | Categoria | Prioridade | Mudança | Esforço | Validação |
|---|---|---|---|---|---|
| MEAS-001 | Medição | P3 | Search Console + Bing Webmaster (AI Performance); enviar `sitemap_index.xml` | Small | Dashboards |
| MEAS-002 | Medição | P3 | Logs Vercel por UA de bots; GA4 por referrer de IA; teste manual mensal | Small | Planilha |
| GEO-001 | GEO | P3 | Declarar política de treino (GPTBot/ClaudeBot) se desejado | Small | `robots.txt` |
| SEO-002/003 | SEO | P3 | Redirects de barra final; `lastmod` real | Small | `curl -sI` / sitemap |
| PERF-002 | Perf | P3 | Cache longo p/ OG image | Small | header |
| EXP-001 | GEO [exp] | P3 | Evoluir `llms.txt` (multi-idioma) — só após os itens acima | Small | — |
