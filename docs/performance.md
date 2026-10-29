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
- `ui.experimental.componentDetection` is on: Nuxt UI generates theme CSS only for
  components found in `app/`. Components resolved from a dynamic name are not
  detected; list them in `ui.experimental.componentDetection` as an array.
- Icons: `icon.clientBundle` bundles the scanned icons and `fallbackToApi` is off,
  so no request goes to `api.iconify.design`. Dynamic icon names (for example
  `i-lucide-${…}`) are not scanned: add them to `icon.clientBundle.icons`.
- The font preload is **not** the cause of the late LCP. A controlled test (6
  runs each, same build and server) gave observed FCP 225–1280 ms with the
  preload and 239–1346 ms without it; both fall into two clusters, about 240 ms
  and about 1265 ms. A single run per variant is not evidence.

## Measurements

`pnpm audit:perf` reports **simulated** metrics (Lighthouse's default
throttling), which are much higher than what the browser actually does. For
observed timings, run Lighthouse with `--save-assets` and read
`firstContentfulPaint` / `largestContentfulPaint::Candidate` from the trace,
relative to `FrameCommittedInBrowser`. Only compare numbers taken the same way.

`componentDetection` + `icon.clientBundle` (HEAD vs working tree, both built the
same way, runs interleaved on the same machine; mobile 5 runs, desktop 3):

| | Entry CSS (raw) | Transfer | Mobile simulated median (FCP / LCP / TBT) | Desktop simulated median (FCP / LCP / TBT) |
|---|---|---|---|---|
| Before | 223 KB | 1342 KB | 6.07 s / 7.56 s / 773 ms | 1.11 s / 1.47 s / 78 ms |
| After | 157 KB (−30%) | 1281 KB (−61 KB) | 5.92 s / 7.93 s / 1052 ms | 1.09 s / 1.49 s / 89 ms |

The size savings are real; the FCP, LCP and TBT differences are within run-to-run
noise (LCP runs span 6.2–8.6 s on both builds), so these changes did not
measurably improve load timing locally. Observed FCP (trace) is bimodal on both
builds, about 260 ms or about 1250 ms (see "Local FCP bimodality" below). The local
server is uncompressed and the machine is noisy: compare runs on the same
machine only. Iconify requests on the homepage: 0 (was 1,
`/api/_nuxt_icon/lucide.json?icons=moon`).

### Local FCP bimodality (investigated, not resolved)

On the local build, the observed first contentful paint (trace) lands either at
about 250 ms or at about 1250 ms. A minimal static page measured with the same
flags always paints in about 40 ms, so it is not the harness. What was ruled out,
each with 6 to 8 interleaved runs against the same static `index.html`:

- Not the rendering mode: the page is prerendered and was also served as plain
  static files (`python -m http.server`), with no Nitro and no hydration.
- Not the JS: removing the entry module script left the FCP unchanged.
- Not the font preload (with and without it behaved the same), the
  `Public Sans Fallback: …` `@font-face` rules (removed, or given
  `font-display: swap`), the particles background, or the images.
- Not a single section: removing only the tech carousel, About or Latest
  articles each left slow runs. Removing everything below the hero made slow
  runs rare (1 of 6), as did a body with only the hero text (1 of 6).

What the trace shows in a slow run: after the first frame at about 205 ms the
compositor requests no main-thread frame until about 1235 ms, and the first
paint with visible text is that later frame. In a fast run frames are
continuous.

The share of slow runs changed between batches for the same page (5 of 6, 5 of 6
and 2 of 8 for the unmodified HTML), so differences between variants of a few
runs are within noise. Do not conclude a cause from fewer than about 20 runs
per variant, and do not act on this number without confirming it in
PageSpeed Insights on a deployed preview.
