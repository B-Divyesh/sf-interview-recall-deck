# Handoff — adversarial first-read review 2

## Status: FAIL

Reviewed live deployment and repository commit
`b2c2d84bd53b9a8a265511e535714af13920acf0` without modifying product code.
The complete report is `.factory/review-2.md`.

## Blocking results

1. Demo mode can lose its banner/namespace after browser Back or after visiting
   Privacy/Terms. Sample state can then be saved into the real IndexedDB
   database.
2. `@claim:local-private` passes because it covers only the happy-path exit; it
   does not detect the live sandbox escape.
3. Malformed known-prefix URLs such as `/deck/junk` return 200 instead of the
   designed 404. The `static-deploy` claim test checks only one root-level
   unknown URL.
4. The static 404 omits the shared skip link and Privacy/Terms footer links, so
   the prior shared-skeleton finding is only partly fixed.

The report also records three major unlisted/subjective claims and six minor
copy issues.

## Verification performed

- Cold live visits at 390×844 and 1440×900, before scrolling.
- Live one-click demo, sample edit, Reset, Start for real, real-data preservation,
  Back-button boundary probes, Privacy transition, IndexedDB namespace checks,
  request logging, and offline reload.
- Live route metadata/focus/status checks, malformed-path probes, ordinary link
  crawl, target-size/overflow checks, and visual screenshot inspection.
- Live `verify-url.sh`: pass with no reported errors.
- Live axe sweep: zero violations on 10 routes at two viewports.
- Clean clone: `npm ci`, `npm test` (6/6), `npm run lint`, `npm run build`, and
  `npm run test:e2e` (44/44) all pass.
- Every command in `.factory/claims.json` ran independently in the clean clone;
  14 commands and 28 browser executions pass. The report explains why two green
  tests do not prove their live claims.

## Reproduce the primary blocker

1. Open `/demo` in a fresh browser.
2. Edit “Checkout reliability launch,” then select Cancel.
3. Use browser Back. The URL still contains `?demo=1`, but the demo banner is
   gone.
4. Select Cancel again. The URL becomes real `/deck` while sample cards remain.
5. Edit a sample and save it. Reload `/deck`; the sample is now in real storage.

No deployment, infrastructure, billing, or product source was changed.
