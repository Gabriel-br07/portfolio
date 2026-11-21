# 05 — Dados Estruturados

## Existente (observado no HTML bruto de produção)
| Página | Tipos | Fonte |
|---|---|---|
| Todas | `Person` (`#person`: name, alternateName, jobTitle localizado, description, email, url, image, knowsAbout[12], worksFor Oby Capital, sameAs[LinkedIn, GitHub]) + `WebSite` (`#website`, inLanguage, author→`#person`) | `app/app.vue` + `app/app.config.ts` |
| `/projects` | `ItemList` de `SoftwareSourceCode`/`CreativeWork` | `app/pages/projects.vue:60` |
| `/blog` | `Blog` + 14 `BlogPosting` | `app/pages/blog/index.vue:14` |
O Agente A também reportou um nó `Organization` no HTML bruto.

**Validação:** inspeção visual do JSON-LD da home (JSON bem formado a olho). **Rich Results Test / validator schema.org não executados** (sem acesso/ferramenta) — Não verificado.

## Consistência com o conteúdo visível
- Identidade, cargo e perfis batem com rodapé e hero [obs].
- `knowsAbout` inclui só techs demonstradas em projetos (Rust, Axum, Python, FastAPI, Prefect, PostgreSQL, OpenSearch, Vue, Nuxt, OAuth2) — **mais conservador que o carrossel** (AEO-004).
- `worksFor: Oby Capital` coerente com a experiência listada (início jul/2026).
- Sem propriedades fabricadas identificadas.

## Problemas / lacunas
1. `email` no `Person` (privacidade; GEO-003). Campo permitido, decisão do autor.
2. `ItemList` sem `author` → `#person`. Small.
3. `BlogPosting`: artigos são do Arandu; confirmar `url`/`author`/`datePublished` reais (não alterar datas). Canonical dos artigos é externo.
4. Sem `dateModified` em nenhuma página.

## Tipos propostos (somente onde há suporte)
| Página | Tipo | Dados existentes | Faltando | Suporte Google | Benefício | Validação |
|---|---|---|---|---|---|---|
| `/about` | `ProfilePage` com `mainEntity` = Person (`@id` `#person`) | name, alternateName, image, sameAs, description | `dateCreated`/`dateModified` (recomendados, devem ser reais) | Doc: ProfilePage para páginas de perfil de pessoa; **obrigatório** `mainEntity` com `name`; sem garantia de rich result | Semântica de identidade; benefício de busca **não garantido** | Rich Results Test + schema validator |
| `/projects/[slug]` (se criadas) | `CreativeWork` / `SoftwareSourceCode` (`codeRepository`, `programmingLanguage`, `author`) | url, tags, date | Descrições reais | Sem rich result específico | Semântica | Validator |
| `BreadcrumbList` | — | — | — | **Não recomendado** (navegação rasa, sem breadcrumbs reais) | — | — |

Não adicionar `Review`, `Rating`, `FAQPage` ou depoimentos (sem conteúdo real; Google restringe FAQ rich results).

## Recomendação
Pequena e justificada: `ProfilePage` em `/about` (P3), `author` no ItemList (P3), decidir sobre e-mail (P3). Nada urgente; o schema atual é coerente.
