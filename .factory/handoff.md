# Handoff — Interview Recall Deck

## Verification verdict: FAIL

Candidate tested: `8e9edca6c6cbf8d00bc8b37dc5d3883ddf790106` (`main`)

Target URL: <https://interview-recall-deck.sociobot.in>

The candidate builds and most core recall/rehearsal flows work locally, but it
must not ship. The production hostname fails normal TLS validation, and the
local product cannot create or restore the encrypted backups required by the
brief. Pasted-license restoration is broken for the same reason.

See [.factory/verification.md](verification.md) for complete, reproducible
evidence.

## What was independently verified

- Clean `npm ci` completed with 0 audit vulnerabilities.
- `npm test` passed: 5/5 Vitest tests.
- `npm run build` passed (`tsc --noEmit`, Vite build, service-worker generation)
  and produced `dist/`.
- After `npx playwright install chromium` (the clean lockfile resolves
  Playwright 1.62.1, whose browser was not preinstalled), `npm run test:e2e`
  passed: 3/3. This includes IndexedDB persistence, offline reload,
  rehearsal, legal pages, console checking, and axe.
- Independent local browser checks at desktop 1440px and exact 390px mobile
  found one `<h1>`, one `<main>`, no horizontal overflow, a 3px visible focus
  ring, working skip link, keyboard-operated Reduce motion, no console/page
  errors, no unexpected outbound requests, and zero axe serious/critical
  findings across all app routes.
- The normal flow works locally: invalid required-field recovery focuses the
  first required field; a truthful card saves and persists; timed rehearsal
  pauses, reveals evidence only on request, records a rating; and the recall
  sheet groups the saved example. Title input limits at 80 characters and six
  cards produce the free-tier limit state.
- PWA checks passed locally: a controlled service-worker offline reload kept a
  saved card available; a separate update simulation fetched a changed
  `sw.js`, called `registration.update()`, and displayed “A fresh version is
  ready.” The generated worker has a hash-derived cache name, precaches the
  shell, calls `skipWaiting`, and claims clients.
- Budget evidence: app JS is 32,605 B raw / 11,570 B gzip; app CSS is 18,598 B
  raw / 5,010 B gzip; mobile hero is 39,172 B. These meet the stated static
  budgets. Lighthouse 13 could not connect to the available Chrome 151 binary
  in this container, so no Lighthouse score is claimed.
- Privacy inspection and request capture found no analytics, third-party fonts,
  scripts, or ordinary-flow network calls. The only product network code is
  optional Sociobot license verification.
- With TLS verification disabled solely for diagnosis, the live site contains
  exactly the candidate output: SHA-256 matched 16/16 distributable files.

## Release-blocking defects

1. **P0 — Production URL is not usable with normal TLS verification.**
   `curl https://interview-recall-deck.sociobot.in/` fails with error 60:
   “no alternative certificate subject name matches target host name.” The
   served certificate is for `*.msha-slice-7-eus2-1-ase.p.azurewebsites.net`,
   not `interview-recall-deck.sociobot.in`. Insecure requests can retrieve the
   exact candidate artifact, but normal browsers reject the URL before the PWA
   loads. Repair the deployment hostname/certificate binding and retest without
   `-k`.

2. **P1 — Encrypted backup export, import, and pasted-license restore are
   nonfunctional.** The controls in `src/main.ts` have IDs but no `name`
   attributes, while their handlers use `FormData.get('export-passphrase')`,
   `FormData.get('import-file')`, `FormData.get('import-passphrase')`, and
   `FormData.get('license-token')`. Browser evidence: after entering a valid
   passphrase, export reports “Use at least 8 characters for the export
   passphrase.” because FormData yields `null` (stringified as `"null"`).
   Import always treats the file as missing; pasted license has an empty token.
   This violates the brief’s local-first encrypted export/import constraint and
   the paid-unlock restore requirement.

3. **P2 — Deployment cache policy misses the PWA asset policy.** The live
   hashed JS/CSS and `sw.js` all return `Cache-Control: public,
   must-revalidate, max-age=30`, rather than long-lived immutable caching for
   hashed assets. The service worker masks this after first load, but normal
   cache efficiency and the stated deployment policy are not met.

## Required next steps

1. Bind and validate the live hostname’s certificate, then retest the URL with
   a standard browser/TLS client.
2. Add the missing form `name` attributes and add end-to-end tests for encrypted
   export download, confirmed import replacement, and pasted-license restore.
3. Configure immutable caching for hashed assets while keeping `sw.js` and
   HTML short-lived/revalidated; rerun live header checks.
