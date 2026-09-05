# Strict review 3 — Interview Recall Deck

**Verdict: PASS**

- Implementation candidate: `9581fd43af8805f60ccad886d6416fcfe30c2a54`
- Documentation baseline reviewed: `d212e9eaf47f0d7d3479814fbd98d53bec949a07`
- Live URL: <https://interview-recall-deck.sociobot.in>
- Reviewed: 2026-09-05
- Findings: **0** at every severity
- Untested public claims: **0**

This is a static, local-first PWA. Backend-only tenant, restart-persistence,
health, and 429/`Retry-After` checks do not apply. CLI, library, and desktop
artifact checks also do not apply.

## Candidate and live runtime

Commits after `9581fd4` change only `.factory/handoff.md` and verification
reports. There is no product-file difference between the implementation
candidate and the documentation baseline. SHA-256 comparisons matched the live
and locally built HTML, JavaScript, CSS, service worker, manifest, and 404 page.
The live runtime is therefore the reviewed implementation candidate; no fresh
product image was required for the later report-only commits.

## First screen, before scrolling

Fresh 1440×900 desktop and 390×844 phone browser contexts opened the live root
at scroll position zero. Both showed one `h1` and one `main`, no horizontal
overflow, the primary action inside the first viewport, and these direct
answers:

| Question | Answer from the first screen |
| --- | --- |
| Job | Recall your work examples in interviews. |
| Audience | Job seekers who freeze under pressure. |
| First action | **Try it with sample data**. The nearby line says it opens three sample cards and starts a 90-second rehearsal. |

The three visible facts were “Saved only in this browser,” “Works offline after
your first visit,” and “No account needed.” The desktop used the product's
generated glass-card landscape; the phone intentionally omitted that large art
from the first viewport. Both layouts were clear and usable.

## Clean checkout and claim commands

A separate clean clone of `d212e9e` was installed before measurement. All
declared project gates passed:

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 152 packages, 0 reported vulnerabilities. |
| `npm test` | PASS — 7/7 tests. |
| `npm run lint` | PASS — no findings. |
| `npm run build` | PASS — type check, Vite build, and service-worker generation; `dist/index.html` exists. |
| `npm run test:e2e` | PASS — 48/48 tests across desktop and 390px mobile. |
| `npm run test:node20` | PASS — tagged runtime check and production build under Node 20. |

The production entry bundle is 42,020 B raw / 14.36 KB gzip, CSS is 20,585 B
raw / 5.41 KB gzip, and the mobile hero is 39,172 B. These remain within the
declared static/PWA budgets.

Every command in `.factory/claims.json` was then invoked independently. The
manifest has 17 entries and the source has exactly one matching tag for each.
Every browser claim passed in both configured projects.

| Claim | Result |
| --- | --- |
| `example-cards` | PASS |
| `rehearsal-controls` | PASS |
| `local-private` | PASS |
| `sample-deck` | PASS |
| `offline-reload` | PASS |
| `recall-sheet` | PASS |
| `speech-actions` | PASS |
| `encrypted-backup` | PASS |
| `csv-export` | PASS |
| `pwa-install` | PASS |
| `free-entitlements` | PASS |
| `accessible-mobile` | PASS |
| `passphrase-private` | PASS |
| `license-restore` | PASS |
| `purchase-unavailable` | PASS |
| `node20` | PASS |
| `static-deploy` | PASS |

I cross-checked the live landing page, product screens, Privacy, Terms, README,
manifest, and deployment copy against this inventory. The sample count/reset,
local privacy, offline behavior, rehearsal actions, voice initiation, recall
sheet, encrypted backup, passphrase handling, CSV export, free limit, existing
license restoration, purchase status, accessibility, Node 20, PWA, and route
statements all map to observable claim tests. No extra public claim remains
untested.

## Live demo and data isolation

The one-click landing action entered a populated sample deck in both fresh
device contexts. It immediately showed these three examples:

- Checkout reliability launch
- New-starter onboarding
- At-risk customer renewal

The checkout example contained a specific situation, action, result from 4.2%
to 0.8%, skills, and “The Friday rollback” cue. The persistent banner said
“Demo — sample data, nothing is saved to your deck” and retained **Reset demo**
and **Start for real** on product and legal routes.

On each device I created a real control example, entered the sample through the
landing action, edited a sample, reloaded, used Back, visited Privacy and Terms,
returned to Deck, reset, and exited. Reset restored exactly the original three
samples. Exit removed `demo:interview-recall-deck`. The real
`interview-recall-deck` record set remained byte-for-byte unchanged throughout,
and no sample record appeared in it.

## Normal, invalid, boundary, and recovery paths

- Normal: creating, saving, reloading, rehearsing, revealing evidence, rating,
  printing, encrypted export/import, and CSV export passed in the clean suite.
- Invalid: submitting an empty editor showed the specific required-fields
  message and focused the first invalid field. A 200-character title was
  constrained to 80 characters.
- Boundary: six live records produced “Your six examples are ready.” Rehearsal,
  recall sheet, encrypted backup, CSV, and accessibility controls stayed
  available.
- Recovery: a wrong live backup passphrase showed the documented recovery
  message; reselecting the file and using the correct passphrase restored the
  record. The offline and storage-error paths have direct recovery copy.
- Navigation: link navigation, Back, and Forward focused the new route `h1`.
  Demo state survived the same history path without changing storage namespace.

## Accessibility, privacy, offline, and performance

- `/opt/fleet/lib/verify-url.sh` passed: title, `lang="en"`, one `h1`, `main`,
  image alt text, button labels, and no console errors.
- Live Axe scans covered `/`, `/demo`, `/deck`, `/edit`, `/rehearse`, `/sheet`,
  `/settings`, `/privacy`, `/terms`, and the 404 at desktop and phone sizes:
  **0 serious and 0 critical violations** in 20 checks.
- At 390px, all visible links, buttons, inputs, selects, and textareas on every
  checked route met 44×44 CSS px minimums. No route had horizontal overflow.
- Keyboard Tab focused the skip link with a 3px outline; Enter moved focus to
  `main`; Space changed the labelled Reduce motion control. The OS reduced-motion
  preference reduced transition and animation durations to `0.00001s`.
- The full live real/demo flow made no cross-origin requests and logged no
  console or page errors. There are no analytics, remote scripts, third-party
  fonts, or tracking calls. Existing license verification is the only declared
  optional external product request.
- A fresh phone context registered the versioned
  `recall-deck-index-CYqP3iRN` cache. Offline reload displayed the offline state
  and opened the seeded 90-second rehearsal.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.31 s, CLS 0, total blocking time 55 ms.

## Routes, links, metadata, and policies

All nine intended routes returned 200 with their own plain-language title,
canonical URL, one `h1`, and one `main`. The live crawl found 19 same-origin
page/skip-link targets and two explicit `mailto:` links; every ordinary
same-origin target returned 200. `robots.txt`, `sitemap.xml`, manifest, icons,
Open Graph image, and offline page also returned 200.

`/does-not-exist`, `/deck/junk`, `/privacy/junk`,
`/edit/not-a-real-id/extra`, and `/rehearse/example_123/extra` deliberately
returned HTTP 404. The designed 404 retained the skip link, primary navigation,
recovery action, footer, Privacy, and Terms. Its own `#main` skip target
therefore also correctly retains the enclosing 404 response; this is expected,
not a broken link.

The root response includes CSP, Permissions-Policy, HSTS, Referrer-Policy, and
`X-Content-Type-Options`. The shell revalidates; hashed assets use a one-year
immutable cache policy.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Review 1 B1 | Fixed — the job, audience, and first action are explicit before scrolling on both devices. |
| Review 1 B2 | Fixed — one-click populated demo, persistent label, separate database, reset, and exit all passed. |
| Review 1 B3 | Fixed — live service-worker registration and offline reload/rehearsal passed. |
| Review 1 B4 | Fixed — 17 claims exist with exactly one matching tag and all commands pass. |
| Review 1 B5 | Fixed — real routes, history focus, and designed HTTP 404 behavior passed. |
| Review 1 B6 | Fixed — no dead purchase action is exposed while new licenses are unavailable. |
| Review 1 M1 | Fixed — route titles, canonical metadata, Open Graph/Twitter metadata, and touch icon are present. |
| Review 1 M2 | Fixed — link, Back, and Forward navigation focus the new `h1` and announce it. |
| Review 1 M3 | Fixed — every route, including 404, uses the shared header, navigation, and footer. |
| Review 1 M4 | Fixed — live 390px target measurements passed on every checked route. |
| Verification P0 | Fixed — ordinary TLS access succeeds for the product hostname. |
| Verification P1 | Fixed — encrypted backup/import and license form controls work; live backup recovery passed. |
| Verification P2 | Fixed — live hashed assets return the immutable one-year cache policy. |
| Review 2 F-2-1 | Fixed — Back/legal-route demo edits never entered real storage. |
| Review 2 F-2-2 | Fixed — `local-private` now covers seeded real data, history, legal routes, exit, and namespace checks. |
| Review 2 F-2-3 | Fixed — all five malformed-path probes returned the shared HTTP 404. |
| Review 2 F-2-4 | Fixed — the 404 has the standard skip link, navigation, footer, and legal links. |
| Review 2 F-2-5 | Fixed — purchase unavailability has its own claim and test. |
| Review 2 F-2-6 | Fixed — Node 20 is declared and its dedicated build command passed. |
| Review 2 F-2-7 | Fixed — the lifetime counters are headed “Your deck now.” |
| Review 2 F-2-8 | Fixed — copy says “sample”; exact three-card seeding and reset have a claim test. |
| Review 2 F-2-9 | Fixed — copy now states the exact six-example free limit. |
| Review 2 F-2-10 | Fixed — README uses plain demo wording and states the direct user result. |
| Review 2 F-2-11 | Fixed — README leads with the browser-storage result before naming IndexedDB. |
| Review 2 F-2-12 | Fixed — encryption copy leads with what the browser does before the algorithm. |
| Review 2 F-2-13 | Fixed — the speech-provider disclosure names what may receive dictated audio. |

## Finding register

There are no findings. This strict review is **PASS** with zero findings of
every severity and zero untested public claims.
