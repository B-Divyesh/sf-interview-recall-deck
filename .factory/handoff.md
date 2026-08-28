# Handoff — Interview Recall Deck repair

## Release status: PASS

Primary repair commit: `71d529f` (followed by this handoff, lint gate, and final keyboard/privacy test coverage). Deployed target: <https://interview-recall-deck.sociobot.in>.

The three independent-verifier findings have been repaired without changing the researched brief, product class, visual system, or successful recall workflow.

## Repairs

1. **P0 — live TLS:** The static deployment was rerun through the factory static deployment configuration, which re-registers the custom domain and managed certificate. On 2026-08-28, ordinary `curl` returned HTTPS 200 and the peer certificate subject/SAN was `interview-recall-deck.sociobot.in`.
2. **P1 — encrypted portability and license restore:** Added the missing `name` attributes for `export-passphrase`, `import-file`, `import-passphrase`, and `license-token`. FormData now receives the values used by the existing export/import/restore handlers.
3. **P2 — cache policy:** Added `public/staticwebapp.config.json`. HTML and `sw.js` are revalidated (`public, max-age=0, must-revalidate`), while hashed `/assets/*` receive `public, max-age=31536000, immutable`. The same configuration adds a restrictive self-hosted CSP, Permissions-Policy, Referrer-Policy, and `nosniff` response policy.

## Regression coverage

- Browser coverage explicitly downloads an encrypted JSON backup with a valid passphrase, verifies it does not expose plaintext, imports it after confirmation, and checks that the restored card is visible.
- Browser coverage intercepts the pilot verification endpoint, pastes a license token, verifies it is stored, and confirms the unlimited state.
- Browser coverage runs on desktop 1440×900 and exact 390×844 mobile. It includes offline reload/persistence, rehearsal, all routes with axe, legal pages, keyboard skip-link and Reduce motion operation, no horizontal overflow, no console errors, and no normal-flow outbound requests.
- Unit coverage asserts the static deployment cache and response-policy configuration, in addition to the existing encrypted data tests.
- Playwright is pinned to `1.58.2`, matching the worker-provided Chromium.

## Verification evidence

- Clean install: `npm ci` — passed, 0 audit vulnerabilities.
- Lint: `npm run lint` — passed (ESLint now checks app, browser tests, and Vite/Playwright configuration).
- Unit/integration: `npm test` — **6/6 passed**.
- Type check and production build: `npm run build` — passed; `dist/index.html` is present. App JS is 32,695 B raw / 11.59 kB gzip; app CSS is 18,598 B raw / 5.01 kB gzip; 768px hero WebP is 39,172 B.
- Browser suite: `npm run test:e2e` — **12/12 passed** across desktop and 390px mobile. It includes the explicit offline reload check (`context.setOffline(true)`) and automated axe checks with no serious or critical violations.
- Local post-build browser verification: `verify-url.sh` — title/lang, one h1, main landmark, image alt coverage, and console all passed (0 errors).
- Live verification: `verify-url.sh https://interview-recall-deck.sociobot.in` — HTTPS 200, 893ms observed load, 0 browser errors, title/lang, one h1, main landmark, 0 missing image alts, and 0 unlabelled buttons.
- Live identity: SHA-256 matched **16/16** public distributable files between `dist/` and the deployed host (the provider intentionally does not serve `staticwebapp.config.json`).
- Live response policy: root and `sw.js` return revalidated cache headers; `assets/app-Wy8rfYlc.js` returns `Cache-Control: public, max-age=31536000, immutable`. Live responses also include CSP, Permissions-Policy, HSTS, Referrer-Policy, and `nosniff`.
- Privacy: normal recall-flow browser requests stayed same-origin; source has no analytics, third-party fonts, or CDN scripts. License verification remains an optional Sociobot API request only.

## Known non-blocker

Lighthouse 13 was attempted against the live deployment using the supplied Chromium, but its tab crashed in this container before producing a score. No Lighthouse score is claimed. The shipped resource sizes are within the stated static-product budgets, and browser/axe verification passed.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
/opt/fleet/lib/deploy-static.sh interview-recall-deck dist
```

No additional product work is required for this repair.
