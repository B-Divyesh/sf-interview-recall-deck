# Handoff — repair 2

## Status: PASS

- Product: Interview Recall Deck, a local-first PWA for job seekers who need to recall truthful work examples during interviews.
- Implementation SHA: `9581fd43af8805f60ccad886d6416fcfe30c2a54`
- Live URL: <https://interview-recall-deck.sociobot.in>
- Deployment: static deployment `8d9e3819-1470-427d-baf2-a18236b72d91` completed successfully on 2026-09-05.

## What changed

- Made storage scope explicit. Every database operation receives either the real or demo namespace; changing browser history now reloads that namespace before rendering.
- Demo query state now persists on Deck, editor, rehearsal, Privacy, and Terms. The banner remains present until Reset demo or Start for real.
- Kept Start for real as the only exit. It deletes `demo:interview-recall-deck`, then opens the real deck.
- Moved editor and rehearsal record identifiers to `?id=` so static routing can use exact route rewrites. Any nested route is now a real HTTP 404.
- Added the shared skip link, four-item navigation, footer legal links, factory credit, build ID, and original-artwork disclosure to the static 404.
- Added outcome-based browser checks for the sandbox history/legal paths, reset seed data, malformed paths, the complete 404 shell, and paused purchases.
- Added the missing sample, purchase-status, and Node 20 claim contracts. Node 20 runs a clean `npm ci`, tagged runtime check, type check, Vite build, and service-worker generation.
- Applied every review-2 copy correction: no “realistic” sample claim, no false daily label, exact free limit, plain database/encryption/dictation wording, and the declared purchase status.

## Review history disposition

| Finding | Current disposition |
| --- | --- |
| Review 1 B1 first-screen clarity | Still fixed. Desktop and 390px cold screens name the job, audience, first action, result, and three facts. |
| Review 1 B2 demo sandbox | Fixed fully. Separate IndexedDB scope survives Back, Forward, Privacy, Terms, Reset, and exit. |
| Review 1 B3 offline | Still fixed. Live demo registered `recall-deck-index-CYqP3iRN`; it reloaded and rehearsed offline. |
| Review 1 B4 claims | Fixed fully. There are 17 declared claims, each with one tagged outcome test; every declared command passed from clean setup. |
| Review 1 B5 routes and 404 | Fixed fully. Intended exact routes return 200; `/does-not-exist`, `/deck/junk`, `/privacy/junk`, and `/edit/not-a-real-id/extra` return 404. |
| Review 1 B6 dead checkout | Still fixed. New purchase UI is absent and the declared “currently unavailable” status is tested. Existing-license restore remains available. |
| Review 1 M1–M4 metadata, route focus, skeleton, mobile targets | Still fixed. The 404 now also has the common skeleton. |
| Review 2 F-2-1 / F-2-2 | Fixed by explicit namespace reload plus the expanded `@claim:local-private` browser flow with a seeded real record. |
| Review 2 F-2-3 / F-2-4 | Fixed by exact static rewrites and the redesigned shared 404. |
| Review 2 F-2-5 through F-2-13 | Fixed by the new purchase/node/sample claims and the documented copy corrections. |

## Verification

Run from the documented clean setup:

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
npm run test:node20
```

Results on this candidate:

- `npm test`: 7/7 passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/index.html` exists.
- `npm run test:e2e`: 48/48 passed across desktop and 390px projects.
- Every command in `.factory/claims.json` ran independently: 16 browser commands passed in both projects (32 executions), plus the Node 20 clean-install/test/build command.
- Bundle: JS 42.02 KB raw / 14.24 KB gzip; CSS 20.59 KB raw / 5.44 KB gzip; mobile hero 39,172 B.
- Local `verify-url.sh`: passed with title, `lang`, one h1, main landmark, alt text, button names, and no console/page errors.
- Local and live Playwright axe checks: zero serious or critical violations across 10 routes at 1440×900 and 390×844 (20 live checks).
- Live link crawl: 15 same-origin links returned 200; `mailto:` links were explicit.
- Live HTTPS: root returned 200 with CSP, Permissions-Policy, HSTS, Referrer-Policy, and `nosniff`; hashed assets returned one-year immutable caching.
- Live PWA: service worker cache `recall-deck-index-CYqP3iRN` registered; fresh demo context reloaded and opened a rehearsal while offline.
- Live demo: fresh desktop and phone contexts showed the persistent label, three populated work-example cards, Reset demo, and Start for real. A seeded real record was byte-for-byte unchanged after sample editing, Back, Privacy, Terms, Reset, and exit.

## First-read evidence

At both fresh 1440×900 and 390×844 visits, before scrolling:

- Job: recall real work examples in interviews.
- Audience: job seekers who freeze under pressure.
- First action: **Try it with sample data**; it opens three sample cards and a 90-second rehearsal.

## Known gaps and next steps

There are no known product gaps. New $9 licenses remain deliberately unavailable; this is visible and covered by `purchase-unavailable`. The standalone `@axe-core/cli` could not start Selenium Chrome in this worker image, so the equivalent Playwright axe integration was used locally and live instead.

For a later paid release, register and verify the Sociobot checkout before exposing a purchase action.
