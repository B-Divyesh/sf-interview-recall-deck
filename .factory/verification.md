# Independent verification — Interview Recall Deck

**Verdict: FAIL**  
**Candidate:** `8e9edca6c6cbf8d00bc8b37dc5d3883ddf790106`  
**URL:** <https://interview-recall-deck.sociobot.in>  
**Date:** 2026-08-27

This was a clean-checkout verification against the researched brief and the
PWA/local-first acceptance contract. Product source was not changed.

## Local gates

| Check | Result | Evidence |
| --- | --- | --- |
| Install | PASS | `npm ci`; 0 audit vulnerabilities |
| Unit tests | PASS | `npm test`: 5/5 passed |
| Type check / production build | PASS | `npm run build`: TypeScript, Vite, SW generation; `dist/` emitted |
| Repository e2e | PASS after browser install | `npm run test:e2e`: 3/3 passed after `npx playwright install chromium` |
| Lint | N/A | No lint script/config is provided |
| Bundle limits | PASS | 11.57 KB gzip JS; 5.01 KB gzip app CSS; 39 KB mobile hero |

The initial e2e attempt correctly exposed an environment prerequisite rather
than an app failure: the lockfile resolves `@playwright/test` 1.62.1 and the
matching Chromium revision was absent. Installing it as directed, then rerunning
the unchanged suite, passed.

## Independent functional and accessibility testing

- **Normal user path:** Created a truthful Situation/Action/Result card,
  persisted it through reload, rehearsed it with pause and delayed evidence
  reveal, recorded a self-rating, and opened the competency-grouped recall
  sheet. Passed.
- **Invalid/recovery paths:** Empty required fields show the product error and
  focus the first invalid field. A 200-character title is limited to 80.
  Six saved examples show the free-deck limit. Passed.
- **Data recovery:** Failed. A valid passphrase does not create an encrypted
  download; the UI instead reports the short-passphrase error. Invalid import
  cannot reach decryption because the file FormData value is absent. See P1.
- **Desktop and exact 390px mobile:** One title/main landmark, 16px body text,
  no horizontal overflow. Passed.
- **Keyboard:** Tab reaches the Skip link; it has a 3px focus outline; Enter
  moves focus to `main`. The hidden Reduce motion checkbox toggles by keyboard
  Space and persists. Passed.
- **Reduced motion:** `prefers-reduced-motion: reduce` reduces transitions to
  `1e-05s`; the in-product switch also applies the reducing class. Passed.
- **Automated accessibility:** `@axe-core/playwright` across home, deck, edit,
  rehearsal, sheet, and settings at desktop and 390px found 0 serious/critical
  violations. Repository e2e axe check also passed.
- **Errors/privacy:** Local normal-flow captures had zero console/page errors
  and zero outbound requests. Source inspection finds no analytics/CDNs; only
  optional Sociobot license verification uses `fetch`.

## PWA checks

- The repository e2e test registered the service worker, waited for control and
  a cached module, set the browser offline, reloaded, and retained a saved card.
  Passed.
- An independent temporary static-server simulation served a byte-changed
  second `sw.js`; `registration.update()` fetched it twice and the app displayed
  “A fresh version is ready.” Passed.
- Manifest includes standalone display, versioned start URL, 192/512 maskable
  icon, and token-matched colors. Passed by inspection.

## Live deployment and response-policy evidence

Normal TLS verification fails:

```text
curl: (60) SSL: no alternative certificate subject name matches target host name
```

The peer certificate SAN names only Azure `*.msha-slice-7-eus2-1-ase...`
domains, not the required product hostname. This blocks ordinary browsers and
is a P0 failure.

For diagnosis only, insecure `curl -k` requests later received the product and
matched SHA-256 for **16/16** candidate distributable files, including HTML,
JS, CSS, manifest, service worker, legal pages, images and icons. The deployed
artifact therefore matches the candidate but is unreachable securely.

Insecure header inspection found HSTS, `Referrer-Policy:
strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`; it did
not find CSP or Permissions-Policy. More importantly, HTML, hashed assets and
`sw.js` all have `Cache-Control: public, must-revalidate, max-age=30`. The
hashed assets do not receive immutable long-lived caching (P2).

## Defects

| Severity | Finding | Impact |
| --- | --- | --- |
| P0 | Certificate SAN excludes `interview-recall-deck.sociobot.in` | Normal users cannot open the product or install/use its PWA. |
| P1 | Missing form names break encrypted export/import and pasted license restore | Violates local-first encrypted portability and purchase restoration. |
| P2 | Hashed assets are cached for only 30 seconds, not immutable | Misses the PWA performance/caching policy. |

## Reproduction for P1

1. Run `npm run build && npm run preview`.
2. Go to Settings → Move or back up your deck.
3. Enter `correct horse battery staple` and select **Download encrypted backup**.
4. Observe “Use at least 8 characters for the export passphrase” and no
   download. Inspecting `new FormData(document.querySelector('#export-form'))`
   has no `export-passphrase` entry. The import and license forms have the same
   missing-`name` defect.

## Follow-up

Do not release this commit. Repair P0/P1, configure P2, then repeat the clean
install, build, repository e2e, live TLS/parity/header checks, and encrypted
backup/import plus license-restore browser tests.
