# Handoff — adversarial first-read review 1

## Status: FAIL

Reviewed commit `1d665c9c7ad5e0584cccf172275a17ce2bf9b13b` and the live site at
<https://interview-recall-deck.sociobot.in> on 2026-08-28. Product code was not
modified. The full report is in `.factory/review-1.md`.

## What was done

- Inspected the live first screen in fresh 390×844 and 1440×900 Chromium
  contexts before scrolling.
- Audited every landing-page and README copy unit with word counts, plain-word
  flags, terminology issues, and proposed rewrites.
- Exercised `/demo` and `?demo=1`, including a storage-isolation probe.
- Checked the absent claims manifest/tags and inventoried the unlisted live and
  README claims.
- Exercised live offline reload and normal-flow network interception.
- Audited titles, metadata, deep links, Back/focus behavior, 404 handling,
  navigation/footer consistency, touch targets, and every discovered link.
- Ran live verification and axe scans on eight routes at mobile and desktop.
- Ran install, unit tests, lint, build, and the full browser suite from a clean
  clone.

## Blocking results

1. The first screen does not name job seekers or the interview situation.
2. No sample-data demo or isolated demo namespace exists; `?demo=1` writes to
   the regular IndexedDB database.
3. Live offline reload fails because the service worker precaches a deployed
   404 (`/staticwebapp.config.json`) and never installs.
4. `.factory/claims.json`, `.factory/demo.md`, and `@claim:*` tests are absent.
5. App navigation is hash-based; real deep links and unknown paths render home
   with HTTP 200, and there is no designed 404.
6. “Buy the $9 lifetime unlock” targets a Sociobot API URL that returns 404.

## Verification commands and results

From a clean clone:

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
```

Results: 6/6 unit tests passed, lint passed, the build produced `dist/`, and
12/12 Playwright tests passed across desktop and 390px mobile. Live axe scans
reported zero automated violations on the app, Privacy, and Terms routes.

The repository's local offline test is not evidence for the live claim: Vite
Preview serves `staticwebapp.config.json`, while the deployment returns 404 for
it. Live Chromium had no service-worker registration and offline reload ended
with `ERR_INTERNET_DISCONNECTED`.

## Next steps

Implement and test the demo namespace first, add the claims manifest and tagged
tests, fix the service-worker precache list, replace hash routes with real routes
plus a designed 404, enable or remove the dead checkout, then apply the copy and
metadata fixes in the report. Re-run the live review from a clean browser after
deployment.
