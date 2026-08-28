# Handoff — independent verification 2

## Release status: PASS

Verified candidate: `766074b1c2103ffee24a34af6c9b5f00d388eafb`
Verified URL: <https://interview-recall-deck.sociobot.in>
Verified: 2026-08-28

The candidate meets the researched offline interview-recall job: users can
capture their own evidence, rehearse it in a pausable round, use a compact
recall sheet, retain data locally, export it encrypted, and recover it.

## Exact verification evidence

- Clean `npm ci`: 152 packages installed, 0 audit vulnerabilities.
- `npm test`: 6/6 passed; `npm run lint`: passed; `npm run build`: passed and
  emitted `dist/`; `npm run test:e2e`: 12/12 passed across desktop and 390px
  mobile.
- Independent functional checks covered required-field focus/recovery, 80-char
  title limit, six-example free-tier boundary, malformed-backup recovery,
  normal recall/rehearsal/reload flow, encrypted backup/restore, and pasted
  license restoration.
- Axe found 0 serious/critical issues on every local app route/device and in
  independent live desktop/mobile checks. Live normal loads had one `h1`, one
  `main`, no console/page errors, no horizontal overflow, and no outbound
  normal-flow requests.
- PWA verification confirmed shell caching, offline reload, persistent local
  data, and the update-available toast after a changed worker. Reduced-motion
  emulation reduces transitions/animations to `1e-05s`.
- Live TLS certificate SAN matches the hostname. All 19 served candidate files
  SHA-256-match `dist/`; HTML/worker revalidate and hashed assets are cached
  immutable for one year. CSP, Permissions-Policy, HSTS, Referrer-Policy, and
  `nosniff` are present.
- Initial app JS is 11,499 B gzip, CSS is 5,037 B gzip, and the mobile hero is
  39,172 B, all within the PWA budgets.

No P0/P1/P2 defects remain. See `.factory/verification-2.md` for complete
method and evidence. Lighthouse was not available as a repository runner; no
score is claimed.

## Re-run

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
```
