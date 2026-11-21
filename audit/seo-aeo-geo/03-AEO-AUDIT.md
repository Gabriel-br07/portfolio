# 03 — AEO (Answer Engine Optimization)

**Teste de extração fundamentada:** respostas extraídas **apenas** de `content/**`, `i18n/` e do HTML de produção (17 URLs, Agente B; contato/headings/home reconferidos por mim). Não prova como ChatGPT, Gemini ou Perplexity responderão.

## Matriz de cobertura
| # | Pergunta | Presente? | Fonte | Qualidade | Lacuna | Recomendação |
|---|---|---|---|---|---|---|
| 1 | Quem é o dev? | Sim | `/` H1 "Hello, I'm Gabriel Oliveira"; JSON-LD Person | Alta | — | — |
| 2 | Especialização | Parcial | `<title>`, JSON-LD `jobTitle`; `about.yml` | Média | Cargo ausente do texto visível da hero (confiança média) | Subtítulo visível com o mesmo cargo do `<title>` |
| 3 | Linguagens/frameworks | Sim | `/projects` (tags), JSON-LD `knowsAbout` | Boa p/ o demonstrado | Carrossel com 31 techs sem projeto/experiência correspondente; LabTech sem tags | Reduzir/rotular carrossel; preencher tags |
| 4 | Experiência | Sim | `/` (Oby Capital, DW Corp, Serpro) | Média | Sem escopo/entregas; empresa só no `alt` do logo; grafias "FullStack/Fullstack/full stack" | Cargo + empresa no texto; 1–2 linhas de escopo reais |
| 5 | Projetos construídos | Sim (4) | `/projects`, ItemList | Boa visibilidade | Sem URL própria; títulos não são headings | Ver AEO-002 |
| 6 | Problemas técnicos resolvidos | Implícito | Descrições dos YAML | Baixa | Sem problema → decisão → resultado | AEO-002 |
| 7 | Evidências de habilidade | Parcial | GitHub, Curupira/LabTech vivos, blog externo | Baixa | **Nenhuma métrica**; `/speaking` são placeholders | AEO-008; não inventar números |
| 8 | Práticas de arquitetura | Sim (palavras-chave) | `about.yml`, Curupira (RBAC/OAuth2/audit), RAG | Média-baixa | Afirmações genéricas; resenhas de livros só em modal | AEO-005 |
| 9 | Onde ver o trabalho | Sim | Rodapé/hero: GitHub, LinkedIn; blog | Boa | Sem link de CV | AEO-009 |
| 10 | Como contatar | **Não no HTML estático** | `ContactModal.vue` (JS); e-mail só no JSON-LD | **Baixa** | 0 `mailto:` e 0 link de agenda no HTML (verificado) | **AEO-001** |

"Não encontrado" no conteúdo público: métricas/resultados de qualquer projeto; descrição do escopo nos cargos; currículo; contato em texto.

## Achados

### AEO-001 — Contato ausente do HTML estático
- **Severidade:** High · **P1** · **Confiança:** High (verificado: `curl | grep -c mailto:` = 0 em `/`, `/about`, `/projects`, `/pt`)
- **Código:** `app/components/ContactModal.vue` (Web3Forms, `hydrate-on-idle`), `app/app.config.ts` (`global.email`, `meetingLink`); `Hero.vue:67` só renderiza `links[0]`.
- **Impacto:** crawlers sem JS, LLMs que leem o HTML e usuários com JS bloqueado não encontram nenhum canal de contato. O e-mail só está no JSON-LD.
- **Recomendação:** `mailto:`/link de agenda em texto no rodapé e em `/about`; linha de contato em `llms.txt`. Decisão de privacidade (exposição de e-mail a scrapers) é do autor — alternativa: link para LinkedIn/agenda.
- **Esforço:** Small · **Validação:** `curl -s URL | grep -c 'mailto:\|cal.com'` > 0.

### AEO-002 — Projetos sem URL própria nem estrutura de case study
- **Severidade:** Medium · **P2** · **Confiança:** High
- **Código:** `content/projects/*.yml` (campos: title, description, image, url, tags, date); não há `app/pages/projects/[slug].vue`.
- **Observado:** 4 projetos, descrição de 2–4 frases; 0 com problema, contribuição pessoal, decisões e resultado; links apontam para fora (curupira.api.br, GitHub, labtech.dwcorp.com.br).
- **Recomendação:** adicionar campos opcionais (`problem`, `role`, `decisions`, `outcome`) renderizados em `/projects` (âncoras) ou página `[slug]`. **Somente fatos do autor; sem inventar métricas.** Se não houver resultado mensurável, omitir o campo.
- **Esforço:** Medium · **Validação:** HTML bruto contém os blocos; ItemList/URLs apontam para âncora/página própria.
- **Ref.:** Google recomenda conteúdo original e útil, sem páginas em massa para manipular respostas (ai-optimization-guide).

### AEO-003 — Cargo/especialização não aparece no texto visível da hero
- **Severidade:** Medium · **P2** · **Confiança:** Medium (Agente B; H1 e parágrafo conferidos, cargo não visto no trecho inspecionado)
- **Recomendação:** subtítulo visível com "Fullstack & Back-End Developer" e foco real; padronizar grafia em todos os idiomas.
- **Esforço:** Small.

### AEO-004 — Carrossel de 31 tecnologias sem evidência
- **Severidade:** Medium · **P2** · **Confiança:** Medium (Agente B: `TechCarousel.vue` hardcoded; .NET, Go, Django, Terraform etc. ausentes de projetos/experiência)
- **Risco:** claims não sustentadas diluem credibilidade e criam divergência com `knowsAbout`.
- **Recomendação:** manter só o que o autor pode comprovar ou rotular como "ferramentas que já usei". Decisão do autor.

### AEO-005 — Resenhas de livros só aparecem após interação
- **Severidade:** Low · **P3** · **Confiança:** Medium
- **Observado:** `whyRead` em modal; 0 ocorrências no HTML de `/books`. Também alt de capas em PT nas páginas en/es.
- **Recomendação:** renderizar texto no DOM (`<details>`), localizar alts. Valor AEO modesto.

### AEO-006 — Hierarquia de headings
- **Severidade:** Low · **P3** · **Confiança:** High (Agente B, 3 idiomas)
- `/about` e `/books`: H1 → H3 (sem H2); `/projects`: só H1.
- **Recomendação:** H2/H3 corretos; títulos de projeto como headings.

### AEO-007 — FAQ e Testimonials: componentes existem, nada renderiza
- **Severidade:** Low · **P3** · **Confiança:** Medium
- `landing/FAQ.vue`, `landing/Testimonials.vue` sem chaves `faq`/`testimonials` nos YAML.
- **Recomendação:** não é necessário FAQ voltado a chatbot. Só adicionar FAQ real se houver perguntas reais de recrutadores. **Não criar depoimentos fictícios.**

### AEO-008 — `/speaking` com eventos placeholder
- **Severidade:** Medium (credibilidade) · **P2** · **Confiança:** Medium
- `speaking.vue` marca "Placeholder events"; 4 palestras sem URL; título da palestra de 2024-06-15 diverge entre en/pt/es. Hoje `noindex` e órfã — **mantê-la assim** até haver eventos reais verificáveis.

### AEO-009 — Sem acesso a currículo
- **Severidade:** Low · **P3** · sem PDF em `public/` nem link. Opcional, a critério do autor.

### AEO-010 — Inconsistências entre idiomas/páginas
- **Severidade:** Low · **P2 (Small)** · **Confiança:** High
- Curupira: `…/en` (en) vs `https://curupira.api.br` (pt/es) — verificado em `content/**/projects/Curupira.yml:4`.
- Grafia do cargo; título da palestra; alt de livros em PT.
- Meta description da home difere do texto visível (menor).

## Recomendações de conteúdo (resumo)
Priorizar poucas melhorias originais: contato visível, blocos de case study reais, cargo claro. Não recomendado: blog genérico, FAQ para chatbot, páginas em massa.
