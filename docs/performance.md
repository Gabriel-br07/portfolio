# Performance audits

## Lighthouse (mobile + desktop, median of 3)

```bash
pnpm build
pnpm audit:perf          # RUNS=5 pnpm audit:perf to change the run count
```

Starts `.output/server/index.mjs`, runs Lighthouse 13 for the mobile (default)
and desktop presets, stores the JSON reports in `.lighthouse/` (gitignored) and
prints the median FCP, LCP, TBT, CLS, Speed Index and transferred bytes.
Needs Chrome (`CHROME_PATH` is auto-detected from `google-chrome`/`chromium`).

## Bundle analysis and sourcemaps

Client sourcemaps are **off in production builds**, so deployed code does not
expose the source. They are opt-in for audits:

```bash
pnpm build:audit         # NUXT_SOURCEMAP=true nuxt build
pnpm analyze:chunks      # source-map-explorer HTML report -> .lighthouse/bundle.html
pnpm analyze             # nuxt analyze (treemap of the client/server bundles)
```

`analyze:chunks` maps each minified `/_nuxt/*.js` chunk back to the original
modules, so Lighthouse's "unused JavaScript" and "forced reflow" entries
(e.g. `/_nuxt/DGdWAxWb.js:20:43228`) can be traced to a package or component.
Chunk hashes change on every build: always re-run the analysis against the
build you are auditing.

To serve a sourcemapped build to Lighthouse, run `pnpm build:audit` then
`pnpm audit:perf`. Do not deploy a `build:audit` output. If error monitoring is
added later, upload the maps privately to it instead of serving them.

## Conventions

- The hero headline and description are the LCP element: keep them static and
  visible in the SSR HTML (no `opacity: 0`, blur, transform or JS gating).
- Entrance animations only on secondary elements, CSS-only, and disabled under
  `prefers-reduced-motion`.
