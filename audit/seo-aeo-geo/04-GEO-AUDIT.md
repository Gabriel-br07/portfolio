# 04 — GEO (Generative Engine Optimization)

Rótulos: **[doc]** documentado oficialmente · **[obs]** observado nesta auditoria · **[interp]** interpretação técnica · **[exp]** experimental · **[mkt]** alegação de mercado · **[NV]** não verificado.

## 1. Acesso de crawlers de IA
`robots.txt` em produção [obs]: `User-agent: * / Disallow:` (vazio) + `Sitemap`. Sem grupos por bot ⇒ todos herdam "permitido"; nenhum conflito.

| Bot | Função (fonte oficial lida pelo Agente C) | Efeito atual |
|---|---|---|
| Googlebot, Bingbot | Busca [NV: doc Google não relida para Googlebot] | Permitido |
| OAI-SearchBot | Descoberta p/ busca do ChatGPT [doc: developers.openai.com/api/docs/bots] | Permitido |
| ChatGPT-User | Retrieval disparado pelo usuário; robots.txt "may not apply" [doc] | Permitido |
| GPTBot | Treino [doc] | Permitido |
| Claude-SearchBot | Indexação p/ busca do Claude [doc: support.claude.com/en/articles/8896518] | Permitido |
| Claude-User | Retrieval do usuário [doc] | Permitido |
| ClaudeBot | Treino [doc] | Permitido |

- Teste por User-Agent (`curl -A`, 1 GET/UA na home): Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot → 200, mesmo `x-vercel-cache: HIT`, sem diferença [obs]. WAF/Bot Fight da Vercel [NV] (sem dashboard).
- **Permitir OAI-SearchBot/Claude-SearchBot não exige permitir GPTBot/ClaudeBot.** Se o autor quiser excluir treino mantendo busca: `Disallow: /` apenas para `GPTBot` e `ClaudeBot`. É decisão de preferência, não de SEO. Não recomendamos abrir/fechar bots sem esse objetivo explícito.

### GEO-001 — Política de crawlers implícita
- **Severidade:** Low · **P3** · **Confiança:** High. Política atual coerente com descoberta; apenas registrar decisão explícita sobre treino (opcional).

## 2. Entidade
- Nome "Gabriel Oliveira" + `alternateName` "Gabriel Faria"; cargo localizado nos 3 idiomas; `sameAs`: LinkedIn e GitHub, iguais aos links do rodapé [obs]. Sem conflito de nome/cargo [obs]. URLs de `sameAs` não testadas ao vivo [NV].
- Grafias do cargo divergentes no texto (AEO-010).

### GEO-004 — Desambiguação de entidade e autoridade externa
- **Severidade:** Medium · **P3** · **Confiança:** Low
- Nome comum; uma busca por nome+domínio não retornou o site [obs, amostra única, não conclusiva]. A melhor evidência técnica (artigos) está no domínio do empregador (`dwcorp.com.br/arandu`), não no portfólio.
- **Recomendação:** `sameAs` incluir o perfil de autor do Arandu (existente); manter perfis públicos consistentes. Não há atalho "GEO" documentado; construir presença verificável é trabalho de longo prazo (sem backlinks artificiais).

## 3. Citabilidade dos projetos
Ver AEO-002. Sem URL própria nem resultados; `RAG` aponta para repositório de organização (`LabTechUDF/RAG-TCC`), não do dev — a contribuição pessoal precisa estar descrita no próprio site.

## 4. Mecanismos específicos de IA
- **Google:** "não há requisitos adicionais" para AI Overviews/AI Mode; elegibilidade = indexada + snippet; dados estruturados não são exigidos; **`llms.txt` não é usado pela Busca** [doc: ai-optimization-guide / ai-features, lidas via subagente]. Nota: a página do guia menciona inclusão do site em relatórios de IA generativa no Search Console; a página "ai-features" diz não haver requisitos técnicos extras — discrepância **não resolvida** nesta auditoria.
- **`/llms.txt`** existe [obs] (200, text/plain, prerenderizado; `/llms-full.txt` 404). Tratar como **[exp]** P3.

### GEO-002 — `llms.txt` com dados defeituosos
- **Severidade:** Medium (qualidade de dados) · **P2** · **Confiança:** High (verificado)
- **Código:** `server/routes/llms.txt.ts:49` — `Stack: ${project.tags.join(', ')}.` sem guarda; `content/projects/LabTech.yml:5` `tags: []` ⇒ "Stack: ." no arquivo publicado.
- Também: seção Experience escrita à mão (`llms.txt.ts:54-55`), risco de divergir de `content/index.yml`; sem contato; só EN.
- **Recomendação:** omitir "Stack" se vazio; derivar experiência do conteúdo; incluir contato. Esforço Small. **Não** investir mais (MCP, mirrors Markdown) sem caso de uso próprio.

### GEO-003 — JSON-LD: e-mail exposto e `sameAs` incompleto
- **Severidade:** Low · **P3** · **Confiança:** High. E-mail pessoal no JSON-LD (`app/app.vue`) é lido em massa; decidir se deve ficar (ver AEO-001). `ItemList` sem `author` apontando para `#person`.

## 5. Visibilidade (observações reais)
- Busca web (1 consulta, nome+domínio): site não apareceu; resultados eram outros desenvolvedores [obs; amostra mínima]. Nenhuma citação de IA foi observada ou testada [NV]. Nada foi fabricado.

## 6. Medição (como obter evidências)
1. **Bing Webmaster Tools → AI Performance** (preview desde 2026-02-10 [doc: blogs.bing.com]): citações totais, páginas citadas, grounding queries; não mede ranking nem posição na resposta; cobre Copilot e resumos Bing. Requer site verificado (inferência).
2. **Google Search Console:** verificar propriedade, enviar `sitemap_index.xml`, relatório de indexação e de Desempenho (aparições em recursos de IA entram em "Web" [doc]).
3. **Logs da Vercel** filtrados por UA (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, Googlebot, Bingbot) por URL/dia [interp].
4. **GA4:** aquisição por origem (chatgpt.com, perplexity.ai, claude.ai, copilot.microsoft.com…) — só visitas com consentimento e com referrer; subestima [interp].
5. **Teste manual mensal** (mesmas perguntas, registrar fontes citadas) [exp].
Nem todos os assistentes expõem analytics equivalentes.

## Hipóteses não sustentadas por documentação (não priorizar)
`llms.txt` melhorar citação; schema "para IA"; reescrever para "chunking" — Google diz explicitamente que não é necessário [doc].
