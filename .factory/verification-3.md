# Independent verification 3 — Interview Recall Deck

**Verdict: PASS**

- Implementation candidate reviewed: `9581fd43af8805f60ccad886d6416fcfe30c2a54`
- Documentation candidate reviewed: `35cf7a07cc778db425aac044a8b8358201fe1551`
- Live URL: <https://interview-recall-deck.sociobot.in>
- Verified: 2026-09-05
- Findings: **0** (all severities)
- Untested public claims: **0**

The candidate is a static local-first PWA. Backend-only checks for tenant
isolation, restart persistence, health endpoints, and 429/`Retry-After` do not
apply; there is no product backend. CLI/library/desktop artifact checks likewise
do not apply.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts were opened before scrolling.
Both showed one visible `h1`, **“Recall your work examples in interviews.”**

- Job: recall real work examples in interviews.
- Audience: job seekers who freeze under pressure.
- First action: **Try it with sample data**; the adjacent text says it opens
  three sample cards and a 90-second rehearsal.

The desktop and phone visual review found the first screen legible, with the
primary action visible, no horizontal overflow, and the described dark memory
landscape identity. The phone layout intentionally omits the large hero image
from the first viewport and retains the four-item bottom navigation.

## Clean checkout and declared claims

From a clean working tree, `npm ci` completed with 0 reported vulnerabilities.
The ordinary declared gates all passed:

| Command | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 7/7 Vitest tests passed. |
| `npm run lint` | PASS | ESLint completed without findings. |
| `npm run build` | PASS | Type checking, Vite build, and service-worker generation passed; `dist/index.html` exists. |
| `npm run test:e2e` | PASS | 48/48 browser tests passed across the configured desktop and 390px mobile projects. |
| `npm run test:node20` | PASS | Node 20 ran its tagged runtime check, type/build path, and service-worker generation. |

The production entry bundle is 42.02 KB raw / 14.36 KB gzip; CSS is 20.59 KB
raw / 5.41 KB gzip. The 39,172 B mobile hero remains within the PWA budgets.

Every command named by `.factory/claims.json` was then run independently. The
17-entry terminal ledger contains 17 `CLAIM` records and one
`ALL_CLAIMS_PASS` marker. Browser claims passed in both configured projects.

| Claim IDs independently exercised | Result |
| --- | --- |
| `example-cards`, `rehearsal-controls`, `local-private`, `sample-deck`, `offline-reload`, `recall-sheet` | PASS |
| `speech-actions`, `encrypted-backup`, `csv-export`, `pwa-install`, `free-entitlements`, `accessible-mobile` | PASS |
| `passphrase-private`, `license-restore`, `purchase-unavailable`, `node20`, `static-deploy` | PASS |

No public statement found on the landing page, product routes, legal pages, or
README was missing from the claims inventory. The sample, privacy, offline,
backup, CSV, free-limit, purchase-status, accessibility, and static-route
statements all have observable tagged coverage.

## Independent live product exercise

In fresh desktop and phone browser storage partitions, I created a real control
example, then entered `/demo` through the one-click landing action. The sample
immediately displayed the three populated examples: Checkout reliability launch,
New-starter onboarding, and At-risk customer renewal. The persistent banner read
“Demo — sample data, nothing is saved to your deck.”

I edited a sample, visited Privacy and Terms, returned through the primary Deck
link, reset the demo, and left with Start for real. The banner survived both
legal routes; Reset restored exactly the three shipped examples; the edit was
gone after reset; leaving removed `demo:interview-recall-deck`. The real control
record was byte-for-byte unchanged before, during, and after this sequence on
both devices.

Normal, invalid, boundary, and recovery paths were also covered by the browser
suite: required editor-field recovery, six-example limit with free rehearsal and
exports, pause/resume/reveal/rate rehearsal, wrong-passphrase backup recovery,
encrypted export/restore, readable CSV export, and existing-license restore
using the declared mocked verification response. New-purchase status correctly
offers no checkout action.

## Accessibility, privacy, PWA, and routes

- Live Axe runs on `/`, `/demo`, `/deck`, `/edit`, `/rehearse`, `/sheet`,
  `/settings`, `/privacy`, `/terms`, and `/does-not-exist` at desktop and phone
  sizes found **0 serious and 0 critical violations** (20 checks).
- On the live phone page, Tab focused the skip link, Enter moved focus to
  `main`, Space changed the labelled Reduce motion control, and there was no
  horizontal overflow. The local suite additionally covers target measurements,
  focus styling, route-focus announcements, and reduced-motion behavior.
- Normal live loads and the complete demo/real-data exercise made no outbound
  requests. There are no analytics, third-party fonts, or CDN scripts. The
  deliberate HTTP-404 navigation reports its own failed resource in DevTools;
  normal routes had no console errors, and the designed 404 itself is expected.
- A fresh live `/demo` visit registered cache
  `recall-deck-index-CYqP3iRN`. After setting the context offline, reload showed
  the offline status and opened the seeded rehearsal. The manifest has standalone
  display, versioned start URL, token-matched colors, and 192/512 icons.
- All 15 discovered same-origin page links returned 200. The two email links are
  explicit `mailto:` targets. Intended routes return 200; `/does-not-exist`,
  `/deck/junk`, `/privacy/junk`, `/edit/not-a-real-id/extra`, and
  `/rehearse/example_123/extra` return the shared HTTP 404. The live 404 has the
  skip link, primary navigation, and Privacy/Terms footer links.
- Every checked route has its own plain-language title. Root responses include
  CSP, Permissions-Policy, HSTS, Referrer-Policy, and `X-Content-Type-Options`.

## Earlier findings disposition

| Earlier findings | Current disposition and evidence |
| --- | --- |
| Review 1 B1, M1–M4 | Fixed: plain first screen, route titles/focus, common shell, 44px mobile checks, keyboard/reduced-motion checks, and live Axe pass. |
| Review 1 B2–B4 | Fixed: one-click isolated sample, persistent banner/reset/exit, local namespace proof, explicit claim inventory, and live offline reload/rehearsal. |
| Review 1 B5–B6 | Fixed: real routes and deliberate shared 404 work; unavailable purchases expose no dead checkout link. |
| Review 2 F-2-1 through F-2-4 | Fixed: real control data remained unchanged through demo edit, legal routes, reset, and exit; malformed nested paths returned shared 404 with the full skeleton. |
| Review 2 F-2-5 through F-2-13 | Fixed: purchase and Node 20 claims are declared/tested, sample/reset claim is observable, and the reviewed copy corrections are present. |

## Finding register

There are no findings. This verification is **PASS** with zero findings and
zero untested claims.
