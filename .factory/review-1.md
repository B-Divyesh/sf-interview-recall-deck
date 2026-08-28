# Adversarial first-read review 1 — Interview Recall Deck

**Verdict: FAIL**

- Live URL: <https://interview-recall-deck.sociobot.in>
- Reviewed: 2026-08-28
- Repository base: `1d665c9c7ad5e0584cccf172275a17ce2bf9b13b`
- Fresh contexts: Chromium at 390×844 and 1440×900
- Blocking findings: 6

The product cannot pass while any blocking finding remains. The first screen does
not name its audience, no isolated sample-data demo exists, the live offline
claim fails, the claims contract is absent, real routes/404 handling are broken,
and the paid checkout link returns 404.

## First screen, before scrolling

The same information was visible before scrolling at both sizes. At 390px, the
headline, supporting copy, both actions, and the three fact fragments fit above
the fixed bottom navigation. The illustration began below the fold.

| Question | Cold-read answer |
| --- | --- |
| What does this do? | It appears to turn past work into cards for practising recall. “Evidence cards” is not explained, and the screen does not say that the recall is for interviews. |
| For whom? | Cannot determine. “Your experience” could address any worker; neither “job seeker” nor an equivalent situation appears on the first screen. |
| What should I click first? | “Add your first example.” This is clear, but it starts data entry rather than a tryable sample. |

### B1 — BLOCKING: the first screen does not identify the user or job

- Quote: “Find the story when you need it.” / “Turn work you’ve already done into short evidence cards. Practise in small, pausable rounds—without sending your notes anywhere.”
- Why this loses a first-time visitor: the headline is a metaphor, “story” and
  “evidence card” are unexplained, and the supporting copy never says “job
  seeker” or “interview.” The product name alone is not enough to answer who it
  is for or what interview problem it solves.
- Concrete fix: use **“Recall your work examples in interviews”** as the
  headline. Follow with **“For job seekers who freeze under pressure, turn real
  projects into cards and rehearse them in short, pausable rounds.”** Put **“Try
  it with sample data”** first and explain beside it: **“See three realistic
  cards and start a 90-second rehearsal.”**

## Findings, ordered by severity

### B2 — BLOCKING: there is no one-click demo, and the demo URL writes to real storage

- Quote/evidence: neither `/demo` nor `/?demo=1` contains “sample data,” “Reset
  demo,” “Start for real,” or a demo banner. Both show the empty production home
  with `EXAMPLES 0`.
- Isolation evidence: a record named “Demo namespace probe” saved under
  `/?demo=1` was present at `/#/deck`. Both modes used the same IndexedDB
  database, `interview-recall-deck`.
- Why this loses or misleads a visitor: the only first action asks the visitor
  to invent and enter personal material before seeing the product work. A URL
  that looks like demo mode is ordinary production mode and can alter the
  visitor's real deck.
- Concrete fix: implement `/demo` with at least three realistic, immediately
  visible interview examples and a ready rehearsal. Show **“Demo — sample data,
  nothing is saved”** persistently, with **“Reset demo”** and **“Start for real.”**
  Use a separate `demo:` IndexedDB namespace and discard it on exit. Document it
  in `.factory/demo.md` and test that demo writes never appear in the real deck.

### B3 — BLOCKING: “Works offline” is false on the live deployment

- Quote: “Works offline”; README: “offline reload support”; privacy page: “work
  offline.”
- Evidence: after an online first visit and four seconds for installation, a
  fresh Chromium context reported zero service-worker registrations and no
  controller. Setting the context offline and reloading produced
  `net::ERR_INTERNET_DISCONNECTED`.
- Cause observed: `sw.js` precaches `/staticwebapp.config.json`, but that URL
  returns HTTP 404. The install rejects the full `Promise.all`, and the app
  suppresses the registration error.
- Why this misleads a visitor: offline availability is one of only three facts
  on the first screen and a core product promise.
- Concrete fix: remove deployment-only files from the precache manifest or
  serve every precached URL successfully. Do not suppress installation failure
  without a visible recovery state. Deploy, then add and pass
  `@claim:offline-reload` against the live-equivalent production output from a
  fresh context.

### B4 — BLOCKING: the required claim inventory and claim tests do not exist

- Quote/evidence: `.factory/claims.json` is absent, `rg '@claim:'` finds no
  tagged tests, and `.factory/demo.md` is absent. There were therefore no listed
  claim commands to run.
- Why this misleads a visitor: the landing page and README make privacy,
  offline, export, accessibility, pricing, and storage promises without the
  required observable tests. The live offline promise is already disproved.
- Concrete fix: add one manifest entry and exactly one sandboxed test for each
  claim in the inventory below. Split compound sentences so each promise maps
  cleanly to one test. Remove any promise that cannot be verified.

#### Unlisted claim inventory

Every row is an unlisted-claim finding because there is no claims manifest.

| Location and claim-like copy | Required observable test |
| --- | --- |
| Landing: “Turn work you’ve already done into short evidence cards.” | In demo mode, create or inspect a card and assert that it contains the user's work fields. |
| Landing: “Practise in small, pausable rounds.” | Start, pause, resume, and finish a seeded round. |
| Landing: “without sending your notes anywhere.” | Intercept the complete demo flow and assert no note-bearing or non-approved request. |
| Landing: “Local-first” / “Stored on this device.” | Save in demo storage, reload, and inspect the local namespace. |
| Landing: “Works offline.” | Warm the app, go offline, reload `/demo`, and use the seeded deck. This currently fails live. |
| Landing: “No account.” | Complete the demo and real first-save path without authentication. |
| Landing: “Open recall sheet” / “Bring a one-page sheet…” | Assert that seeded cards appear in a printable one-page view. |
| README: “It is deliberately not an answer generator…” | Confirm saved situation/action/result/cue values equal user or sample input and no generated content appears. |
| README: “There is no account, cloud sync, analytics, or diagnostic claim.” | Assert no auth UI and no analytics/cloud request during the full sandbox flow; check diagnostic wording separately. |
| README: “Data lives in IndexedDB in the current browser.” | Inspect the expected real and demo database namespaces and records. |
| README: “60- or 90-second pausable rehearsal…” | Exercise each advertised free duration and hidden/reveal state. |
| README: “User-initiated text-to-speech and optional browser-native dictation.” | Stub browser speech APIs and assert they run only after their named user actions. |
| README: “Printable one-page recall sheet grouped by competency.” | Seed multiple competencies, verify grouping, and assert print output/layout. |
| README: “AES-256-GCM encrypted JSON backup/import and readable CSV export.” | Inspect encryption metadata/ciphertext, restore it, and validate CSV headers and rows. |
| README: “Installable PWA with a versioned app-shell cache and offline reload support.” | Validate manifest/installability, cache version, and offline navigation using deployed-path behavior. |
| README: “Free six-example deck; $9 one-time license unlock…” | Assert the six-card boundary and paid entitlements; exercise a valid checkout/restore sandbox. |
| README: “Keyboard operation, strong focus states, reduced motion, and a 390px mobile UI.” | Run keyboard flow, computed focus contrast, reduced-motion behavior, and 390px overflow/touch-target checks. |
| README: “Examples, settings, and session history stay in the browser.” | Intercept create/settings/rehearsal flows and inspect local persistence. |
| README: “The encrypted backup passphrase is never stored and cannot be recovered.” | Search all browser storage and exported metadata for the passphrase; verify wrong-passphrase recovery. |
| README: “Speech recognition … may use its vendor’s processing.” | Either scope this as a disclosure rather than a product guarantee, or test the app's own request boundary with a stubbed vendor API. |
| README: “The paid unlock follows the Sociobot hosted-checkout contract.” | Follow the production-equivalent checkout and verify a successful Sociobot handoff. The live link currently returns 404. |
| README: “No product ID or payment-provider secret is embedded…” | Scan built and source artifacts for provider secrets and direct provider integration. |
| README: “Accessibility features, rehearsal, the recall sheet, and all export paths remain free.” | Exercise each feature at the free entitlement. |
| README deployment claims about `dist/`, cache headers, and response-policy headers | Build in a clean clone and assert output files and deployed response headers. |

The normal, non-demo save flow emitted zero browser requests after initial load,
so the narrow “notes are not sent while saving” behavior was observed. It does
not satisfy the contract because it was not run in an isolated demo and has no
claim entry.

### B5 — BLOCKING: routes and 404 handling are broken

- Quote/evidence: navigation uses `/#/deck`, `/#/edit`, `/#/rehearse`,
  `/#/sheet`, and `/#/settings`. Direct `/deck`, `/settings`, `/demo`, `/404`,
  and `/does-not-exist` requests all return HTTP 200 and render the home page.
- Why this loses a visitor: copied or indexed product URLs cannot open the
  intended screen, and a mistyped URL silently pretends to be valid. There is
  no designed 404 or way to understand the mistake.
- Concrete fix: give each screen a real History API route, configure navigation
  fallback for those routes, and render a styled 404 for unknown paths. Add
  direct-load, reload, back/forward, title, focus, and 404-status tests.

### B6 — BLOCKING: the paid checkout action is dead

- Quote: “Buy the $9 lifetime unlock.”
- Evidence: its exact live target,
  `https://api.sociobot.in/api/v1/products/interview-recall-deck/checkout`,
  returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
  All same-origin links crawled successfully; this was the only HTTP dead link.
- Why this misleads a visitor: the Settings page offers a specific paid result
  that cannot be purchased.
- Concrete fix: register/enable the product in the Sociobot billing API and add
  a sandboxed checkout contract test. Until it succeeds, remove or disable the
  purchase claim and explain that payment is unavailable.

### M1 — MAJOR: per-route metadata and sharing metadata are incomplete

- Quote/evidence: every app hash route retains “Interview Recall Deck — practice
  your own evidence,” including Deck, Edit, Rehearse, Recall sheet, and Settings.
  No tested route has a canonical link, Open Graph title/image, Twitter card, or
  apple-touch icon.
- Why this matters: browser history and assistive navigation do not identify the
  current screen, and shared/search previews lack canonical identity and the
  product's real artwork.
- Concrete fix: use route titles such as **“Deck — Interview Recall Deck”** and
  **“Settings — Interview Recall Deck.”** Add canonical URLs, OG/Twitter fields,
  a 1200×630 product-art image, and the existing 180px touch icon or a generated
  equivalent to every route template.

### M2 — MAJOR: route-change focus targets the whole main region, not the new heading

- Quote/evidence: after a navigation and after Back, `document.activeElement`
  is `<main id="main" tabindex="-1">`; the new `h1` is not focused. Back does
  restore the hash route.
- Why this matters: a screen-reader user is not placed on or told the specific
  new page heading as required by the routing contract.
- Concrete fix: give the route `h1` a programmatic focus target, focus it after
  navigation with `preventScroll`, and announce that heading in the polite live
  region. Test both link navigation and browser Back.

### M3 — MAJOR: the shared skeleton is inconsistent and incomplete

- Quote/evidence: the app has five primary nav links, while the legal pages have
  only the opposite legal link. The app footer omits “Built by Param Factory”
  and a build/version; legal footers omit the standard Privacy/Terms pair and
  product one-liner. The landing page has no explicit “what it does not do /
  privacy” section and no priced-tier section despite advertising a paid tier
  elsewhere.
- Why this matters: visitors lose consistent navigation and cannot evaluate the
  privacy boundary or $9 offer from the expected landing-page sequence.
- Concrete fix: use one header/footer contract on every route, keep primary nav
  to four destinations, add Privacy, Terms, builder credit, and build ID to the
  footer, then add plain privacy/non-goal and exact-price sections before it.

### M4 — MAJOR: several mobile links miss the 44px touch-target baseline

- Quote/evidence at 390px: the app wordmark measures 87×30; app footer Privacy
  43×14 and Terms 35×14. Legal-page header, nav, email, and footer links measure
  16–26px high; even the hidden skip-link target measures 42px high when shown.
- Why this matters: these controls are harder to tap accurately on a phone and
  fail the stated accessibility baseline.
- Concrete fix: add padding/minimum block size so every interactive target has
  a 44×44px hit area without relying on adjacent text. Add computed-box checks
  for the app and both legal pages at 390px.

## Copy audit

Counts use whitespace-separated words; hyphenated compounds count as one.
Headings, labels, actions, facts, and image copy are included because they are
part of the first-read experience. Code blocks and bare link targets in the
README are not sentences. No banned plain-words terms were found. Landing copy
averages 4.0 words per item and has no item over 22 words. README copy averages
9.6 words per item; two README sentences exceed the hard cap. The displayed
action labels use result-naming verbs; the failure is the missing sample action,
not an ambiguous existing button.

### Landing page

| ID | Exact copy | Words | Flag and concrete rewrite |
| --- | --- | ---: | --- |
| L01 | Skip to main content | 4 | — |
| L02 | Recall Deck | 2 | — |
| L03 | Home | 1 | — |
| L04 | Deck | 1 | — |
| L05 | Rehearse | 1 | — |
| L06 | Recall sheet | 2 | — |
| L07 | Settings | 1 | — |
| L08 | Your experience, easier to reach | 5 | **Vague heading.** Rewrite: “Recall real work examples.” |
| L09 | Find the story when you need it. | 7 | **Metaphorical headline; not the job.** Rewrite: “Recall your work examples in interviews.” |
| L10 | Turn work you’ve already done into short evidence cards. | 9 | **Unexplained term and no audience.** Rewrite: “Turn a real project into a card with your action and result.” |
| L11 | Practise in small, pausable rounds—without sending your notes anywhere. | 9 | **Two ideas and an unlisted privacy claim.** Rewrite as: “Rehearse in short, pausable rounds.” / “Your notes stay in this browser.” |
| L12 | Add your first example | 4 | Result-naming action, but it must be secondary to the sample demo. |
| L13 | Open recall sheet | 3 | Result-naming action. |
| L14 | Local-first | 1 | **Jargon.** Rewrite: “Saved only in this browser.” |
| L15 | Works offline | 2 | Plain, but false on the live deployment. Fix the behavior before retaining it. |
| L16 | No account | 2 | — |
| L17 | Three glass memory cards connected by glowing paths and evidence points | 11 | Image alt text is concise and purpose-related. |
| L18 | Scattered details become a path you can retrace. | 8 | **Metaphor.** Rewrite: “Connect work details to prompts you can rehearse.” |
| L19 | Today’s landscape | 2 | **Metaphorical heading.** Rewrite: “Your progress today.” |
| L20 | Your deck at a glance | 5 | — |
| L21 | Examples | 1 | — |
| L22 | Competencies | 1 | **HR jargon.** Rewrite: “Interview skills.” |
| L23 | Rehearsals | 1 | — |
| L24 | A lighter preparation path | 4 | **Vague heading.** Rewrite: “How rehearsal works.” |
| L25 | Recall, don’t recite | 3 | **Slogan lacks context.** Rewrite: “Rehearse your own examples.” |
| L26 | Capture one true moment | 4 | — |
| L27 | Save the situation, what you did, and what changed. | 9 | — |
| L28 | Practise the doorway | 3 | **Metaphorical heading.** Rewrite: “Practise from one cue.” |
| L29 | Use a short cue to find the story before revealing your notes. | 12 | “Story” conflicts with “example.” Rewrite: “Use a short cue to recall the example before revealing your notes.” |
| L30 | Carry the landmarks | 3 | **Metaphorical heading.** Rewrite: “Use your recall sheet.” |
| L31 | Bring a one-page sheet of prompts—not a script—to the interview. | 10 | — |
| L32 | Private by default. | 3 | **Vague/unlisted privacy claim.** Rewrite: “Your notes stay in this browser.” |
| L33 | Stored on this device. | 4 | “Device” conflicts with the more accurate “browser.” Rewrite: “Stored in this browser.” |
| L34 | Privacy | 1 | — |
| L35 | Terms | 1 | — |
| L36 | Original generated artwork | 3 | — |

### README

| ID | Exact sentence, heading, or list item | Words | Flag and concrete rewrite |
| --- | --- | ---: | --- |
| R01 | Interview Recall Deck | 3 | — |
| R02 | Interview Recall Deck is an offline-first preparation tool for job seekers who find it hard to retrieve concrete examples under interview pressure. | 22 | **“Offline-first” is jargon and currently false live.** Rewrite: “Interview Recall Deck helps job seekers retrieve real work examples under interview pressure.” |
| R03 | It turns the user’s own projects into short evidence cards, supports calm timed rehearsal, and produces a one-page pre-interview recall sheet. | 21 | **Three ideas and unexplained “evidence cards.”** Rewrite as: “Turn each project into a short evidence card.” / “Rehearse it in a timed round.” / “Print a one-page recall sheet.” |
| R04 | It is deliberately not an answer generator: every situation, action, result, and cue comes from the user. | 17 | — |
| R05 | There is no account, cloud sync, analytics, or diagnostic claim. | 10 | Compound unlisted claim; retain only after separate tests cover each promise. |
| R06 | Data lives in IndexedDB in the current browser. | 8 | **Implementation jargon in user-facing introduction.** Rewrite: “Your data stays in this browser.” |
| R07 | Live site | 2 | — |
| R08 | Features | 1 | — |
| R09 | Structured situation/action/result cards with competency tags and recall cues | 9 | **Slash construction and HR jargon.** Rewrite: “Cards capture the situation, your action, the result, interview skills, and a short recall cue.” |
| R10 | 60- or 90-second pausable rehearsal with evidence hidden until requested | 10 | — |
| R11 | User-initiated text-to-speech and optional browser-native dictation | 6 | **Technical jargon.** Rewrite: “Read prompts aloud or use your browser’s optional dictation.” |
| R12 | Printable one-page recall sheet grouped by competency | 7 | Rewrite “competency” as “interview skill” for consistent terminology. |
| R13 | AES-256-GCM encrypted JSON backup/import and readable CSV export | 8 | **Protocol jargon in feature summary.** Rewrite: “Download an encrypted backup or a readable CSV file.” |
| R14 | Installable PWA with a versioned app-shell cache and offline reload support | 11 | **PWA/app-shell jargon and false live claim.** Rewrite after fixing: “Install the app and reopen it offline after your first visit.” |
| R15 | Free six-example deck; $9 one-time license unlock for unlimited examples, longer rounds, and local rehearsal history | 16 | Clear pricing, but the checkout is dead and the claims are unlisted. |
| R16 | Keyboard operation, strong focus states, reduced motion, and a 390px mobile UI | 12 | **“Strong” is vague.** Rewrite: “Use every control by keyboard, at 390px, or with reduced motion.” |
| R17 | Run locally | 2 | — |
| R18 | Requires Node.js 20 or newer. | 5 | — |
| R19 | Open the URL printed by Vite. | 6 | — |
| R20 | Local development uses the Sociobot pilot billing API; the deployed *.sociobot.in site uses the production API. | 16 | Appropriate developer detail, but add a link to the billing contract. |
| R21 | Test and build | 3 | — |
| R22 | The exact production build command is npm run build. | 9 | — |
| R23 | Output lands in dist/ with dist/index.html at its root. | 9 | — |
| R24 | The end-to-end test expects the production build to exist and automatically serves it with vite preview. | 16 | Rewrite for directness: “Build first. The end-to-end command serves `dist/` with Vite Preview.” |
| R25 | If Chromium is not already present, run npx playwright install chromium once. | 12 | — |
| R26 | Data and licensing | 3 | — |
| R27 | Examples, settings, and session history stay in the browser. | 9 | —, but it needs a claim test. |
| R28 | The encrypted backup passphrase is never stored and cannot be recovered. | 11 | —, but it needs a claim test. |
| R29 | Speech recognition is supplied by the browser and may use its vendor’s processing; using it is optional. | 17 | **Two ideas.** Rewrite as: “Dictation uses your browser’s speech recognition.” / “Its vendor may process audio.” |
| R30 | The paid unlock follows the Sociobot hosted-checkout contract. | 8 | **Internal jargon.** Rewrite: “Sociobot handles payment and license checks.” |
| R31 | No product ID or payment-provider secret is embedded in this repository. | 11 | Appropriate developer detail, but it needs an artifact scan claim test. |
| R32 | Accessibility features, rehearsal, the recall sheet, and all export paths remain free. | 12 | **“Export paths” is jargon.** Rewrite: “Rehearsal, the recall sheet, accessibility controls, backups, and CSV exports remain free.” |
| R33 | See the visual thesis, privacy, and terms for more detail. | 10 | — |
| R34 | Deployment | 1 | — |
| R35 | Deploy the contents of dist/ as a static site. | 9 | — |
| R36 | History fallback is not needed for app navigation because app routes use URL fragments; /privacy/ and /terms/ are emitted as real static paths. | 23 | **Over 22 words and documents noncompliant hash routing.** Rewrite after routing work: “Give every app screen a real URL and configure history fallback. Keep Privacy and Terms as static routes.” |
| R37 | public/staticwebapp.config.json ships with the build: it revalidates HTML and sw.js, caches hashed /assets/ for one year with immutable, and sends the product response-policy headers. | 24 | **Over 22 words; three ideas; “response-policy” jargon.** Rewrite: “`public/staticwebapp.config.json` ships with the build. It revalidates HTML and `sw.js`. It caches hashed assets for one year and sends security headers.” |
| R38 | License | 1 | — |
| R39 | MIT. | 1 | — |
| R40 | See LICENSE. | 2 | — |

### Terminology finding

The same core object is called “work,” “project,” “story,” “moment,” “evidence,”
“evidence card,” and “example.” The practice metaphor also introduces
“landscape,” “path,” “doorway,” and “landmarks.” This increases recall load in a
product intended to reduce it.

Use this terminology consistently:

| Concept | One term |
| --- | --- |
| A user's real interview case | example |
| The saved collection | deck |
| Situation, action, and result details | evidence |
| A retrieval hint | recall cue |
| A practice session | rehearsal |
| Skill grouping | interview skill |
| Printable summary | recall sheet |

## Structure, accessibility, and visual checks

| Check | Result | Evidence |
| --- | --- | --- |
| `<title>` pattern | Partial | Home title follows the product/job pattern and is under 60 characters; app routes do not set route-specific titles. |
| One `h1`, `main`, `lang`, alt text, console | Pass | Live root and all tested routes had one `h1`, one `main`, `lang="en"`, no missing image alt, and no console/page errors. |
| Meta description | Partial | Present and under 155 characters, but it repeats the false offline claim. |
| Canonical/OG/Twitter/apple-touch | Fail | Absent on root, all app routes, Privacy, and Terms. SVG favicon is present. |
| Real 404 and deep links | Fail — blocking | Unknown and intended app paths return 200 and the home screen; only hash routes select app screens. |
| Back button and route focus | Partial | Back restores the prior hash route; focus moves to `main`, not the new `h1`. |
| Link crawl | Fail — blocking | Same-origin links return 200 and mail links are explicit; the paid checkout link returns 404. |
| Header/footer | Fail | App and legal skeletons differ; required builder/version/legal elements are incomplete. |
| Keyboard and automated accessibility | Pass with manual target-size finding | Live axe found zero violations on eight routes at both sizes. Clean-clone keyboard/reduced-motion tests passed. Several mobile targets remain below 44px. |
| Contrast | Pass in automated scan | Axe found no color-contrast violations on tested live routes. |
| Reduced motion | Pass locally | The repository's browser test verifies the user control; source also has a `prefers-reduced-motion` path. |
| Visual identity | Pass | The midnight glass-card landscape, cyan route lines, coral evidence lights, asymmetric desktop plane, and mobile bottom rail are product-specific and do not resemble a generic centered SaaS hero. Provenance is recorded in `.factory/design.md` and disclosed in the footer. |
| Landing skeleton | Fail | Three steps exist, but explicit audience, demo, privacy/non-goal section, and paid tier are missing from the landing sequence. |

## Verification record

### Live checks

- `/opt/fleet/lib/verify-url.sh`: HTTP 200; one `h1`, one `main`, `lang="en"`,
  no missing image alt, no unlabeled button, and no console/page errors.
- Playwright + axe: zero automated violations on `/`, all six app views,
  `/privacy/`, and `/terms/` at 390×844 and 1440×900.
- Fresh first-screen screenshots were inspected at both viewport sizes.
- Link crawl: root, Privacy, Terms, image, and icon resources returned 200;
  checkout returned 404.
- Offline interception: zero registrations/controller after first visit;
  offline reload failed with `ERR_INTERNET_DISCONNECTED`.
- Normal save request interception: no requests occurred after initial load.
- Demo isolation probe: the record written under `?demo=1` remained in the same
  IndexedDB database when returning to normal mode.

### Clean-clone checks

Run from a fresh clone of `1d665c9c7ad5e0584cccf172275a17ce2bf9b13b`:

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 152 packages, 0 audit vulnerabilities |
| `npm test` | Pass; 6/6 |
| `npm run lint` | Pass |
| `npm run build` | Pass; `dist/` produced; JS 32.70 kB raw / 11.59 kB gzip |
| `npm run test:e2e` | Pass; 12/12 across desktop and 390px projects |
| Listed claim tests | **Cannot run:** `.factory/claims.json` is missing |

The local offline end-to-end check passes because Vite Preview serves
`staticwebapp.config.json`; the live host intentionally does not. That mismatch
is exactly why a deployed-path claim test is required.
