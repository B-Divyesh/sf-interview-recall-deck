# Adversarial first-read review 2 — Interview Recall Deck

**Verdict: FAIL**

- Live URL: <https://interview-recall-deck.sociobot.in>
- Reviewed: 2026-08-28
- Repository commit reviewed: `b2c2d84bd53b9a8a265511e535714af13920acf0`
- Fresh contexts: Chromium at 390×844 and 1440×900
- Findings: 4 blocking, 3 major, 6 minor

The first screen and normal demo path are clear and usable, but the demo sandbox
can cross into real storage after ordinary navigation. Unknown paths beneath
known route prefixes also render as valid pages. These regressions make the
demo-isolation and 404 promises false even though their related tests pass.

## First screen, before scrolling

At both viewports, the headline, audience sentence, primary action, stated demo
result, and three facts appeared without scrolling. At 390px the bottom of the
third fact was at 762px, above the fixed navigation beginning at 782px.

| Question | Cold-read answer |
| --- | --- |
| What does this do? | It saves real work examples as cards and helps me rehearse recalling them for interviews. |
| For whom? | Job seekers who freeze or struggle to recall examples under interview pressure. |
| What should I click first? | **Try it with sample data.** The adjacent copy says this opens three cards and starts a 90-second rehearsal. |

The exact first-screen text that supplied those answers was “Recall your work
examples in interviews,” “For job seekers who freeze under pressure…,” and
“Try it with sample data.” This part passes the mandatory first-read check.

## Findings, ordered by severity

### F-2-1 — BLOCKING: demo navigation can write a sample into real storage

- Prior finding: review 1 B2, regressed/only partly fixed.
- Quote: “Demo — sample data, nothing is saved to your deck.”
- Live reproduction A: open `/demo` → edit “Checkout reliability launch” →
  Cancel → browser Back. The URL is `/edit/demo-checkout?demo=1`, but the demo
  banner disappears. Select Cancel again and the URL becomes `/deck` without
  `demo=1`; all three sample cards remain in memory. Edit the checkout sample,
  rename it “Sandbox escape probe,” and save. After reload, that sample exists
  in the real `interview-recall-deck` database.
- Live reproduction B: open `/demo` → Privacy → Deck. Privacy removes the demo
  banner while leaving `demo:interview-recall-deck` present, and Deck then shows
  the three in-memory sample cards on the real `/deck` URL.
- Code evidence: `src/main.ts:243` intentionally drops demo state for Privacy
  and Terms; `src/main.ts:406` recomputes `demoMode` from the route name only on
  `popstate`, ignoring `?demo=1`. The app also keeps the already-loaded sample
  array when the namespace changes.
- Why this misleads: an ordinary Back or legal-page visit silently ends the
  visible sandbox and can turn the next sample edit into real saved data. This
  directly contradicts the banner, README, demo contract, and `local-private`
  claim.
- Concrete fix: derive demo state from both path and query on every navigation,
  including `popstate`. Preserve `?demo=1` on legal routes, or atomically clear
  demo storage and reload real storage before leaving. Never reuse an in-memory
  demo collection on a real route. Test Back, Forward, Privacy, Terms, Reset,
  and Start for real with a pre-existing real record and assert that the real
  database remains byte-for-byte unchanged.

### F-2-2 — BLOCKING: the sandbox claim test passes while its guarantee is false

- Prior finding: review 1 B4, only partly fixed.
- Quote in `.factory/claims.json`: “No account, cloud sync, analytics, or
  tracking; deck data stays in this browser.” Its sandbox promises “separate
  real/demo IndexedDB namespaces.”
- Evidence: both executions of
  `npm run test:e2e -- --grep @claim:local-private` pass. The test at
  `tests/claims.spec.ts:52-70` exercises only edit → reload → Start for real. It
  does not exercise Back, Forward, Privacy, Terms, or a transition from sample
  state to a real route. F-2-1 proves the advertised isolation false outside
  that one happy path.
- Why this misleads: a green tagged claim test currently certifies behavior the
  deployed product does not provide.
- Concrete fix: keep exactly one `@claim:local-private` test, but expand it to
  cover every demo exit/navigation path and a seeded real deck. Fail whenever
  the banner disappears while sample state is loaded, a demo URL loses its
  namespace, or a sample record appears in real IndexedDB.

### F-2-3 — BLOCKING: malformed routes bypass the designed 404

- Prior finding: review 1 B5, only partly fixed.
- README quote: “`staticwebapp.config.json` rewrites known app routes, returns
  the designed 404 for unknown paths…”
- Live evidence: `/does-not-exist` correctly returns 404, but `/deck/junk`,
  `/privacy/junk`, and `/edit/not-a-real-id/extra` each return HTTP 200 and
  render Deck, Privacy, and the new-example editor respectively. Each malformed
  URL also becomes its own canonical URL.
- Code evidence: `src/main.ts:49-54` accepts any path whose first segment is a
  known route and ignores excess segments. `public/staticwebapp.config.json:13-20`
  uses broad `/route*` rewrites. The `static-deploy` claim test checks only
  `/does-not-exist`.
- Why this misleads: mistyped and stale deep links look valid, can expose an
  unintended editor, and contradict the claimed 404 contract. This is broken
  routing, which is blocking under the review contract.
- Concrete fix: accept exact paths for routes without parameters and exactly
  one valid ID segment for edit/rehearse routes. Send every other shape to the
  styled 404 with HTTP 404. Add malformed known-prefix cases to the single
  `@claim:static-deploy` test and to the live crawl.

### F-2-4 — BLOCKING: the 404 does not use the shared site skeleton

- Prior finding: review 1 M3, only partly fixed and therefore blocking again.
- Location: `public/404.html:10`.
- Evidence: normal routes provide the skip link and footer links for Settings,
  Privacy, and Terms. The 404 has no skip link and its footer contains no
  Privacy or Terms links; those links move into a separate “Legal” header. The
  404 therefore does not use the header/footer contract claimed as fixed in the
  prior handoff.
- Why this matters: keyboard and returning visitors meet a different navigation
  structure at the exact moment they need recovery.
- Concrete fix: give the 404 the same skip link, wordmark/header navigation,
  footer one-liner, Privacy, Terms, builder credit, and build ID as every other
  route. Add `/does-not-exist` to the shared-shell test, not only the axe scan.

### F-2-5 — MAJOR: purchase-unavailable copy is an unlisted claim

- Quotes: landing, “The planned $9 purchase is currently unavailable.” README,
  “New $9 license purchases are paused while checkout is repaired.”
- Evidence: no `.factory/claims.json` entry states or tests purchase
  unavailability. `license-restore` covers only restoration and happens to
  assert that no Buy link is present.
- Why this matters: purchase availability is time-sensitive information a
  visitor may rely on; an incidental assertion is not its claim contract.
- Concrete fix: add one claim entry whose observable test confirms there is no
  purchase action or checkout request, or remove the status explanation. Use
  the simpler sentence **“New $9 licenses are currently unavailable.”**

### F-2-6 — MAJOR: Node 20 compatibility is an unlisted claim

- Quote: README, “Use Node.js 20 or newer.”
- Evidence: there is no claim entry, `package.json` has no `engines` field, and
  this review ran under the worker's current Node version rather than a Node 20
  matrix.
- Why this matters: a contributor may choose Node 20 based on an unverified
  compatibility promise.
- Concrete fix: add `engines.node`, run install/test/build under Node 20 in the
  claim test or CI matrix, and list that claim. Otherwise state only the version
  actually verified.

### F-2-7 — MINOR: “Your progress today” labels lifetime totals

- Quote/location: landing above Examples, Interview skills, and Rehearsals.
- Evidence: the values are the total current deck and full stored session list;
  no date filter is applied in `homeView()`.
- Why this matters: the heading gives the counters a false daily scope.
- Concrete rewrite: **“Your deck now.”**

### F-2-8 — MAJOR: the sample count is unlisted and “realistic” is subjective

- Quotes: landing, “See three realistic cards…”; README, “It includes three
  realistic examples…”; demo, “Choose a realistic example…”
- Evidence: no claim entry promises three seeded examples or tests Reset back to
  exactly those three. “Realistic” is also a marketing adjective with no
  observable pass condition.
- Why this matters: the first action promises a specific ready-made result, but
  the claims inventory does not name it and the adjective cannot be verified.
- Concrete rewrites: **“See three sample cards and start a 90-second
  rehearsal.”** / **“It includes three work examples.”** / **“Choose an example
  and begin a 90-second rehearsal.”** Add a demo-seeding claim that verifies the
  three exact records and Reset behavior.

### F-2-9 — MINOR: “complete free deck” is vague and conflicts with paid limits

- Quote: landing heading, “Keep using the complete free deck.”
- Why this matters: the paid license adds unlimited examples, longer rounds,
  and history, so “complete” does not name what is complete.
- Concrete rewrite: **“Keep six examples for free.”**

### F-2-10 — MINOR: “isolated” is README jargon

- Quote: “Try the isolated sample deck…”
- Why this matters: it names an implementation property instead of the user
  result and currently overstates F-2-1.
- Concrete rewrite after fixing isolation: **“Try the sample deck. Demo changes
  never touch your deck.”**

### F-2-11 — MINOR: the README leads with “IndexedDB” instead of the result

- Quote: “Real data uses the `interview-recall-deck` IndexedDB database.”
- Why this matters: the browser API name is useful to maintainers but not clear
  on first read.
- Concrete rewrite: **“Real data stays in the browser database named
  `interview-recall-deck` (IndexedDB).”**

### F-2-12 — MINOR: the encryption sentence is protocol-first

- Quote: “Encrypted backups use AES-256-GCM.”
- Why this matters: the acronym is unexplained and separates the mechanism from
  the useful privacy boundary.
- Concrete rewrite: **“Your browser encrypts each backup before download using
  AES-256-GCM.”**

### F-2-13 — MINOR: “vendor may process audio” is vague

- Quote: “Dictation uses browser speech recognition, whose vendor may process
  audio.”
- Why this matters: “vendor” does not tell the user that audio may leave the
  device through the browser's speech service.
- Concrete rewrite: **“Your browser's speech provider may receive the audio you
  dictate.”**

## Copy audit

Counts use whitespace-separated words; hyphenated terms count as one. The audit
includes headings, labels, actions, footer copy, and the hero alt text. Code
blocks and raw command lines are excluded. Landing copy averages 5.2 words
across 48 items; README copy averages 7.6 words across 40 items. No item exceeds
22 words, and no banned plain-words term appears. All action controls name a
result. Flags point to findings above.

### Landing page

| ID | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| L01 | Skip to main content | 4 | — |
| L02 | Recall Deck | 2 | — |
| L03 | Home | 1 | — |
| L04 | Deck | 1 | — |
| L05 | Rehearse | 1 | — |
| L06 | Recall sheet | 2 | — |
| L07 | Interview practice from your own work | 6 | — |
| L08 | Recall your work examples in interviews | 6 | — |
| L09 | For job seekers who freeze under pressure, turn real projects into cards and rehearse them in short, pausable rounds. | 19 | — |
| L10 | Try it with sample data | 5 | — |
| L11 | Add your first example | 4 | — |
| L12 | See three realistic cards and start a 90-second rehearsal. | 9 | F-2-8 |
| L13 | Saved only in this browser | 5 | — |
| L14 | Works offline after your first visit | 6 | — |
| L15 | No account needed | 3 | — |
| L16 | Three glass example cards connected by glowing recall paths | 9 | — |
| L17 | Connect work details to prompts you can rehearse. | 8 | — |
| L18 | Your progress today | 3 | F-2-7 |
| L19 | Your deck at a glance | 5 | — |
| L20 | Examples | 1 | — |
| L21 | Interview skills | 2 | — |
| L22 | Rehearsals | 1 | — |
| L23 | How it works | 3 | — |
| L24 | Rehearse your own examples | 4 | — |
| L25 | Capture one real example | 4 | — |
| L26 | Save the situation, what you did, and what changed. | 9 | — |
| L27 | Practise from one cue | 4 | — |
| L28 | Use a short cue to recall the example before revealing your notes. | 12 | — |
| L29 | Use your recall sheet | 4 | — |
| L30 | Bring a one-page sheet of prompts—not a script—to the interview. | 10 | — |
| L31 | Clear boundaries | 2 | — |
| L32 | Your notes stay in this browser | 6 | — |
| L33 | The app does not create interview answers, sync a cloud copy, or track how you use it. | 17 | — |
| L34 | Dictation is optional and may use your browser vendor. | 9 | F-2-13 |
| L35 | Read the privacy details | 4 | — |
| L36 | Optional one-time license | 3 | — |
| L37 | Keep using the complete free deck | 6 | F-2-9 |
| L38 | Six examples, rehearsal, the recall sheet, accessibility controls, and exports stay free. | 12 | — |
| L39 | The planned $9 purchase is currently unavailable. | 7 | F-2-5 |
| L40 | Existing license holders can restore access in Settings. | 8 | — |
| L41 | Open Settings | 2 | — |
| L42 | Rehearse real work examples in your own words. | 8 | — |
| L43 | Settings | 1 | — |
| L44 | Privacy | 1 | — |
| L45 | Terms | 1 | — |
| L46 | Built by Param Factory | 4 | — |
| L47 | v1.1.0 | 1 | — |
| L48 | Original generated artwork | 3 | — |

### README

| ID | Exact copy | Words | Flag |
| --- | --- | ---: | --- |
| R01 | Interview Recall Deck | 3 | — |
| R02 | Interview Recall Deck helps job seekers recall real work examples under interview pressure. | 13 | — |
| R03 | Try the isolated sample deck at `https://interview-recall-deck.sociobot.in/demo`. | 7 | F-2-10 |
| R04 | It includes three realistic examples and never reads or changes your real deck. | 13 | F-2-1/F-2-2/F-2-8 |
| R05 | What it does | 3 | — |
| R06 | Capture the situation, your action, the result, interview skills, and a recall cue. | 13 | — |
| R07 | Rehearse for 60 or 90 seconds, pause, resume, and reveal your saved evidence. | 13 | — |
| R08 | Read prompts aloud or use optional browser dictation after you choose it. | 12 | — |
| R09 | Print a one-page recall sheet grouped by interview skill. | 9 | — |
| R10 | Download an encrypted backup or a readable CSV file. | 9 | — |
| R11 | Install the app and reopen the sample deck offline after your first visit. | 13 | — |
| R12 | The app does not generate interview answers. | 7 | — |
| R13 | Your examples, settings, and rehearsal history stay in this browser. | 10 | — |
| R14 | There is no account, cloud sync, analytics, or tracking. | 9 | — |
| R15 | The free deck holds six examples. | 6 | — |
| R16 | Rehearsal, the recall sheet, accessibility controls, backups, and CSV exports stay free. | 12 | — |
| R17 | New $9 license purchases are paused while checkout is repaired. | 10 | F-2-5 |
| R18 | Existing license holders can restore access in Settings. | 8 | — |
| R19 | Run locally | 2 | — |
| R20 | Use Node.js 20 or newer. | 5 | F-2-6 |
| R21 | Open the URL printed by Vite. | 6 | — |
| R22 | The direct demo entry is `http://localhost:5173/demo` or `/?demo=1`. | 8 | — |
| R23 | Test and build | 3 | — |
| R24 | Each entry in `.factory/claims.json` names its exact browser command. | 9 | — |
| R25 | Build output goes to `dist/`, with `index.html` at its root. | 10 | — |
| R26 | Privacy and data | 3 | — |
| R27 | Real data uses the `interview-recall-deck` IndexedDB database. | 7 | F-2-11 |
| R28 | Demo data uses `demo:interview-recall-deck`. | 4 | — |
| R29 | Leaving or resetting the demo deletes its data. | 8 | F-2-1/F-2-2: false for Privacy/Terms exits |
| R30 | Encrypted backups use AES-256-GCM. | 4 | F-2-12 |
| R31 | The passphrase is not stored and cannot be recovered. | 9 | — |
| R32 | Dictation uses browser speech recognition, whose vendor may process audio. | 10 | F-2-13 |
| R33 | See the visual thesis, privacy policy, and terms. | 8 | — |
| R34 | Deployment | 1 | — |
| R35 | Run `npm run build`, then deploy `dist/` as a static site. | 11 | — |
| R36 | `staticwebapp.config.json` rewrites known app routes, returns the designed 404 for unknown paths, and sets cache and security headers. | 18 | F-2-3: false for malformed known-prefix paths |
| R37 | The factory command is: | 4 | — |
| R38 | License | 1 | — |
| R39 | MIT. | 1 | — |
| R40 | See LICENSE. | 2 | — |

Terminology is otherwise consistent: **example**, **deck**, **evidence**,
**recall cue**, **rehearsal**, **interview skill**, and **recall sheet** each
refer to one concept. The catalog line starts with a verb, contains 65 visible
characters, and uses no banned marketing term.

## Demo, privacy, and offline evidence

The one-click path itself passes. `/demo` immediately shows three named cards:
“At-risk customer renewal,” “New-starter onboarding,” and “Checkout reliability
launch.” The persistent banner is present on normal sample routes. Editing then
selecting Reset demo restores the original three records. Selecting Start for
real deletes `demo:interview-recall-deck` and preserves a pre-existing “Real
marker” in `interview-recall-deck`.

The request log for the normal edit/reset/exit flow contained no cross-origin
request and no console error. A fresh context registered one service worker and
cache `recall-deck-index-loVIk81w`; after `context.setOffline(true)`, `/demo`
reloaded with its banner, offline notice, and all three cards. Those checks do
not mitigate the navigation escape in F-2-1.

## Claims verification

A clean local clone at the reviewed commit was installed with `npm ci` and
built before claim execution. Every command in `.factory/claims.json` was run
separately; each executed once in desktop Chromium and once at 390px.

| Claim ID | Result | Executions |
| --- | --- | ---: |
| `example-cards` | Listed test passes | 2/2 |
| `rehearsal-controls` | Listed test passes | 2/2 |
| `local-private` | **Test passes, claim false in live navigation; F-2-1/F-2-2** | 2/2 |
| `offline-reload` | Listed test and live replay pass | 2/2 |
| `recall-sheet` | Listed test passes | 2/2 |
| `speech-actions` | Listed test passes | 2/2 |
| `encrypted-backup` | Listed test passes | 2/2 |
| `csv-export` | Listed test passes | 2/2 |
| `pwa-install` | Listed test and live registration pass | 2/2 |
| `free-entitlements` | Listed test passes | 2/2 |
| `accessible-mobile` | Listed test passes | 2/2 |
| `passphrase-private` | Listed test passes | 2/2 |
| `license-restore` | Listed fixture test passes | 2/2 |
| `static-deploy` | **Test passes, 404 claim false for known-prefix junk; F-2-3** | 2/2 |

F-2-5, F-2-6, and F-2-8 are the remaining unlisted claims. No listed command
returned a non-zero status, but two tests are too narrow to prove their stated
claims.

## History audit

All earlier `.factory/review-*.md` files and `.factory/handoff.md` were read.
There are no earlier polish files.

| Earlier finding | Live and code result |
| --- | --- |
| B1 first-screen clarity | Fixed. The job, audience, primary sample action, outcome, and three facts fit at 390px and desktop. |
| B2 demo and isolation | **Regressed/half-fixed: F-2-1.** Happy path works; Back and legal-route transitions can cross into real storage. |
| B3 live offline | Fixed. Service worker, versioned cache, offline reload, banner, and sample use passed live. |
| B4 claims inventory/tests | **Half-fixed: F-2-2, F-2-5, F-2-6, F-2-8.** Inventory exists, but two green tests miss false behavior and three claims are unlisted. |
| B5 real routes/404 | **Half-fixed: F-2-3.** Expected routes and a root-level unknown work, but malformed known-prefix paths bypass 404. |
| B6 dead checkout | Fixed. No purchase link remains; all ordinary crawled links return 200 or are explicit `mailto:` links. |
| M1 route metadata | Fixed. Each route updates title and canonical/OG/Twitter title; favicon, 180px touch icon, and 1200×630 OG image exist. |
| M2 route focus | Fixed. Link navigation and browser Back focus the new `h1` and update the live region. |
| M3 shared skeleton | **Half-fixed: F-2-4.** App/legal routes share the shell, but the 404 omits the skip link and legal footer links. |
| M4 44px mobile targets | Fixed on every normal route and the 404 in the 390px computed-box scan. |
| Terminology finding | Fixed apart from the copy flags listed above. Core product terms are consistent. |

## Structure, accessibility, links, and visual identity

| Check | Result |
| --- | --- |
| Title pattern and one `h1` | Pass on `/`, Demo, Deck, Edit, Rehearse, Recall sheet, Settings, Privacy, Terms, and the 404. |
| Description/canonical/OG/Twitter/favicon | Pass in the browser on all tested routes; assets are present at the required sizes. |
| Designed 404 | Partial/fail: correct root-level 404 and visual treatment, but F-2-3 and F-2-4 remain. |
| Deep links, Back, route focus | Pass for normal real routes; demo-mode Back fails isolation per F-2-1. |
| Link crawl | Pass for 15 ordinary internal targets; all return 200. Mail links are explicit. |
| Header/footer | Pass on app/legal routes; fail on the 404 per F-2-4. |
| Accessibility automation | Live axe: zero violations of any impact on 10 routes at both viewports. `verify-url.sh`: one `h1`, one main, `lang=en`, complete alt/button names, zero console/page errors. |
| Keyboard/mobile | Visible 3px focus, working skip link, reduced-motion control, no horizontal overflow, and no sub-44px visible controls in the sampled routes. |
| Visual identity | Pass. The asymmetric midnight landscape, glass memory panes, cyan paths, coral evidence points, route rail, and product artwork are distinct from a generic SaaS template. Provenance and tokens are recorded in `.factory/design.md`. |
| Landing order | Pass. Header, first screen, live deck status, three steps, privacy/non-goals, pricing status, and footer appear in the required order. |
| First-load JS | Pass: 41.29 KB raw / 14.19 KB gzip, below the product limits. |

## Quality-gate record

Run in a clean clone of the reviewed commit:

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 152 packages, 0 vulnerabilities |
| `npm test` | Pass; 6/6 |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/index.html`; JS 41.29 KB raw / 14.19 KB gzip |
| Every listed claim command | 14 commands pass; 28/28 browser executions |
| `npm run test:e2e` | Pass; 44/44 |
| Live `verify-url.sh` | Pass; HTTP 200 and no reported errors |
| Live axe sweep | Pass; 0 violations on 20 route/viewport combinations |

## Missed leverage

No additional AI feature is justified. The brief distinguishes truthful recall
from answer generation, and capture, rehearsal, encrypted import/export, CSV,
and the recall sheet cover the obvious workflow. The repository contains no AI
runtime, provider key, Azure endpoint, or decorative AI control. Cloud sync
would conflict with the local-first privacy position unless it were an explicit
opt-in product expansion.

## What would make this perfect

Fix the demo-state transition as one storage-boundary operation, expand the
single privacy claim test across Back/Forward and legal-page exits, reject every
malformed route shape with the designed 404, and put the 404 on the shared
navigation skeleton. Then list the two remaining claims and apply the seven
copy rewrites above. Re-run the complete review from a fresh context; perfection
requires zero findings, including no green test that can miss a live
counterexample.
