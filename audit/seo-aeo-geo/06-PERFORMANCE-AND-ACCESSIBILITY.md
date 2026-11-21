# 06 — Performance e Acessibilidade

## Medições
**Nenhuma medição de Lighthouse/CWV foi realizada.** Não há Chrome/Chromium/Lighthouse no ambiente (`which` retornou vazio) e instalar pacotes é proibido pelo escopo. Dados de campo (INP/LCP/CLS reais): **Não verificado** — `@vercel/speed-insights` está no `nuxt.config.ts`, mas se está habilitado no dashboard é desconhecido. Não reportamos números simulados.

Limiares oficiais (web.dev/vitals, atualizado 2024-10-31; p75, mobile e desktop separados): LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1. Lighthouse (lab) não mede INP.

**Como medir (reprodutível):**
1. Lab: `npx lighthouse https://gabrielfaria.dev.br --preset=desktop` e padrão (mobile) em máquina com Chrome; salvar JSON em `audit/seo-aeo-geo/`.
2. Campo: Vercel Speed Insights (habilitar), Search Console → Core Web Vitals, CrUX/PageSpeed Insights.

## Sinais observados (sem afirmar CWV)
- HTML prerenderizado servido pela edge (HIT), `/_nuxt/*` com cache imutável de 1 ano [obs].
- Config indica otimizações deliberadas: `ui.experimental.componentDetection`, fontes só latin/sem itálico com preload de uma fonte, ícones em bundle (sem API), `docs/performance.md`.
- `og-image.jpeg`: `max-age=0` (cache de imagem social sem cache; impacto de performance mínimo).
- Sem scripts de terceiros no HTML bruto; GA4 só após consentimento [obs].
- Hidratação: carrossel, typed.js e modais carregados com `hydrate-on-idle` (Agente B) — custo não medido.

### PERF-001 — Medição ausente
- **Severidade:** Medium (lacuna de evidência) · **P2** · rodar Lighthouse mobile/desktop e habilitar Speed Insights. Esforço Small.

### PERF-002 — Cache da imagem OG
- **Severidade:** Low · **P3** · definir `Cache-Control` longo para `/images/seo/og-image.jpeg` (ou nome com hash). Esforço Small.

## Acessibilidade (Agente B, HTML de produção)
- OK: landmarks (header/nav/main/footer), skip link, `lang` correto, `aria-label` em ícones, alt em fotos/logos.
- Headings: `/about`, `/books` pulam H2; `/projects` sem headings nos cards (AEO-006).
- Links: "View Project" repetido 4× (card + botão duplicam link); "FullStack Developer at" sem empresa no texto (AEO-003/004 relacionados).
- Alts de capas de livros em português nas páginas en/es.
- Conteúdo atrás de interação: resenhas (modal), formulário de contato (JS).
- Contraste e navegação por teclado: **Não verificado** (sem ferramenta de browser).
