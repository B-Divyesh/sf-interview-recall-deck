# Handoff — perfection loop round 1

## Status: PASS

Primary repair commit: `4524270`; deterministic gate follow-up: `83d5f0e` on
`main`. Artifact class remains a static,
local-first offline PWA. The luminous glass landscape, original generated art,
dark-only palette, and interaction grammar are preserved.

## Blocking review findings closed

1. **B1 first screen:** headline is “Recall your work examples in interviews.”
   It names job seekers, pressure, the sample action, its result, and three
   tested facts within the 390×844 first screen.
2. **B2 demo:** `/demo` and `/?demo=1` seed three realistic examples. The
   persistent banner includes Reset demo and Start for real. Demo records use
   `demo:interview-recall-deck`; real records use `interview-recall-deck`.
   Leaving demo deletes the demo database.
3. **B3 offline:** `staticwebapp.config.json` is excluded from precache. Failed
   registration now produces a visible recovery alert. A warmed `/demo`
   reloads and remains usable with the context offline.
4. **B4 claims:** `.factory/claims.json` inventories 14 claims. Each ID appears
   in exactly one tagged observable browser test. Copy was simplified and
   audited in `.factory/copy-audit.md`.
5. **B5 routes:** Home, Demo, Deck, Edit, Rehearse, Recall sheet, Settings,
   Privacy, and Terms use History API URLs. Titles, canonical URLs, heading
   focus, Back/Forward, route announcements, and direct reloads are tested.
   Unknown direct requests return the designed `404.html` with status 404.
6. **B6 checkout:** the Sociobot endpoint still returns its external
   “enabled factory product” 404. The dead purchase action and purchase promise
   were removed. The UI plainly says purchases are paused. Existing license
   restore remains tested against the Sociobot contract.

The major findings are also closed: every route gets full sharing metadata and
the derived 1200×630 preview; route focus moves to `h1`; header/footer/legal
links are shared; navigation has four primary items; Privacy and pricing status
appear on the landing page; and interactive targets pass 44×44 checks at 390px.

## Verification evidence

- `npm ci`: 152 packages installed; 0 audit vulnerabilities.
- `npm run lint`: pass.
- `npm test`: 6/6 Vitest unit/integration tests pass.
- `npm run build`: pass; `dist/index.html` exists.
- `npm run test:e2e`: 44/44 pass across 1440×900 and 390×844 Chromium.
- Fresh clone of `83d5f0e`: install, lint, 6/6 unit tests, production build,
  and the complete 44/44 browser suite all pass.
- Clean clone of `4524270`: `npm ci` and `npm run build` pass. Every one of the
  14 claim commands was invoked independently; 28/28 desktop/mobile claim
  executions pass.
- Offline claim: fresh context, service-worker controller and versioned cache,
  context offline, `/demo` reload, then seeded rehearsal entry — pass.
- Privacy claim: full sample edit/reload/exit flow has zero cross-origin
  requests; real and demo database names are inspected before and after exit.
- Axe integration covers all app/legal routes and the direct 404 at both
  viewports: 0 serious or critical violations.
- `verify-url.sh http://127.0.0.1:4173 .factory/evidence/local`: HTTP 200,
  title/lang, one `h1`, main landmark, 0 missing alts, 0 unlabeled buttons, and
  0 console/page errors. Report: `.factory/evidence/local/verify.json`.
- Lighthouse 13 mobile: performance 98, accessibility 100, best practices 100,
  SEO 100; LCP 1.8 s, CLS 0, total blocking time 130 ms. Report:
  `.factory/evidence/local/lighthouse.json`.
- Production resources: JS 41.29 KB raw / 14.19 KB gzip; CSS 20.59 KB raw /
  5.41 KB gzip; mobile hero 39.17 KB; social preview 150.56 KB.
- Visual inspection: 390×844 first screen and demo, plus 1440×900 landing,
  have no horizontal overflow and retain the product-specific art direction.

## Run and verify

```sh
npm ci
npm run lint
npm test
npm run build
npm run test:e2e
```

Run any individual claim using its command in `.factory/claims.json`. The
production-equivalent test server is `node scripts/serve-dist.mjs`.

## Deploy

```sh
/opt/fleet/lib/deploy-static.sh interview-recall-deck dist
```

Deployment `460bd108-5391-4397-a621-4d0b77713faf` completed successfully on
2026-08-28. Azure reused `sf-interview-recall-deck` in `eastus2`; the custom
domain reported Ready and <https://interview-recall-deck.sociobot.in> returned
HTTPS 200.

Live post-deploy evidence:

- `/`, `/demo`, `/deck`, `/privacy`, and `/terms`: HTTP 200.
- `/does-not-exist` and `/staticwebapp.config.json`: HTTP 404.
- Live `verify-url.sh`: one `h1`, one main landmark, complete alt/button names,
  and zero console errors. Report: `.factory/evidence/live/verify.json`.
- Fresh 390px live context: `/?demo=1` replaced to `/demo`, rendered three
  cards, opened only `demo:interview-recall-deck`, and registered cache
  `recall-deck-index-loVIk81w`. Offline reload retained the banner, controller,
  and all three cards with zero console errors.
- Root responses revalidate; hashed JS is immutable for one year. Live CSP,
  Permissions-Policy, HSTS, Referrer-Policy, and `nosniff` headers are present.

## Known gaps

No blocking finding remains. New purchase checkout is intentionally unavailable
until the external Sociobot product registration is enabled; the product has no
dead purchase link or purchase-availability claim.
