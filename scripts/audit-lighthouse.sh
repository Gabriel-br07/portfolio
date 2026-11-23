#!/usr/bin/env bash
# Runs Lighthouse (mobile + desktop, 3 runs each) against the built app and
# prints the median of the main metrics. Requires a previous `pnpm build`.
# Env: RUNS (default 3), PORT, OUT (report directory, default .lighthouse),
#      AUDIT_PATH (page to audit, default /), CHROME_PATH.
set -euo pipefail

PORT="${PORT:-3123}"
RUNS="${RUNS:-3}"
OUT="${OUT:-.lighthouse}"
AUDIT_PATH="${AUDIT_PATH:-/}"
[[ $AUDIT_PATH == /* ]] || { echo "AUDIT_PATH must start with / (got: $AUDIT_PATH)" >&2; exit 1; }
export OUT
export CHROME_PATH="${CHROME_PATH:-$(command -v google-chrome || command -v chromium || true)}"

mkdir -p "$OUT"
# The median below reads every report in $OUT: drop old ones so runs with another RUNS or page never mix.
rm -f "$OUT"/mobile-*.json "$OUT"/desktop-*.json
PORT="$PORT" node .output/server/index.mjs > "$OUT/server.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for attempt in $(seq 1 60); do
  curl -sf "http://localhost:$PORT/" > /dev/null && break
  if [ "$attempt" = 60 ]; then
    echo "Server did not answer on port $PORT within 60s, see $OUT/server.log" >&2
    exit 1
  fi
  sleep 1
done

for preset in mobile desktop; do
  args=(--output=json --quiet --chrome-flags="--headless=new --no-sandbox")
  [ "$preset" = desktop ] && args+=(--preset=desktop)
  for i in $(seq 1 "$RUNS"); do
    npx --yes lighthouse@13 "http://localhost:$PORT${AUDIT_PATH}" "${args[@]}" --output-path="$OUT/$preset-$i.json"
  done
done

node -e '
const fs = require("fs");
const med = a => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
for (const p of ["mobile", "desktop"]) {
  const runs = fs.readdirSync(process.env.OUT).filter(f => f.startsWith(p + "-") && f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(process.env.OUT + "/" + f)).audits);
  const m = k => med(runs.map(a => a[k].numericValue)).toFixed(0);
  console.log(p, { FCP: m("first-contentful-paint"), LCP: m("largest-contentful-paint"),
    TBT: m("total-blocking-time"), CLS: med(runs.map(a => a["cumulative-layout-shift"].numericValue)).toFixed(3),
    SI: m("speed-index"), bytes: m("total-byte-weight") });
}'
