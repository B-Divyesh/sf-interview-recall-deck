# Independent verification 2 — Interview Recall Deck

**Verdict: PASS**
**Candidate:** `766074b1c2103ffee24a34af6c9b5f00d388eafb`
**Live URL:** <https://interview-recall-deck.sociobot.in>
**Verified:** 2026-08-28

This is a fresh, independent verification against the researched brief and the
PWA/local-first acceptance contract. Product source was not changed.

## Repository gates

| Check | Result | Fresh evidence |
| --- | --- | --- |
| Clean checkout/install | PASS | Started at the candidate commit with a clean worktree. `npm ci` installed 152 packages and reported 0 vulnerabilities. |
| Unit/integration | PASS | `npm test`: 2 files, 6 tests passed. This includes encrypted export/decrypt and deployment-policy coverage. |
| Lint | PASS | `npm run lint` completed with no findings. |
| Type check + production build | PASS | `npm run build` completed TypeScript checking, Vite build, and service-worker generation; `dist/index.html` exists. |
| Production browser suite | PASS | `npm run test:e2e`: 12/12 passed on 1440×900 desktop and 390×844 mobile. |

The built entry JavaScript is 32,695 B raw / 11,499 B gzip and app CSS is
18,598 B raw / 5,037 B gzip. The mobile hero is 39,172 B WebP. All are within
the static/PWA budgets (JS ≤200 KB gzip, CSS ≤50 KB gzip, mobile hero ≤300 KB).

## Independent product exercise

- Created, saved, reloaded, rehearsed, paused, revealed, rated, and surfaced
  a truthful Situation/Action/Result example on the recall sheet. The shipped
  browser suite separately exercised encrypted download/restore, license
  restore, and offline persistence; all passed.
- Required empty example fields give “Add the project, situation, your action,
  and the result before saving.” and focus the title field. A 200-character
  title input is constrained to 80 characters.
- At six examples, the deck reports “Free deck complete” and the editor routes
  to “Your six examples are ready,” while rehearsal remains available.
- An invalid encrypted file produces the recovery message “That file or
  passphrase did not work. Check both and try again.” The short export
  passphrase is blocked by the native minimum-length control before export.
- Keyboard-only verification passed: Tab reaches the Skip to main content
  link; Enter transfers focus to `main`; the labelled Reduce motion toggle is
  operable by Space. The designed cyan 3px `:focus-visible` outline is present.
- Reduced-motion emulation reports both button transition and animation
  duration as `1e-05s`. Desktop and exact 390px mobile have no horizontal
  overflow; manual visual review found the responsive rail, controls, content,
  and footer legible and unobscured.
- Axe runs in the repository browser suite cover all app routes on both device
  sizes with 0 serious/critical findings. An additional live axe run at desktop
  and 390px also found 0 serious/critical findings. Both live loads had one
  `h1`, one `main`, and zero console or page errors.

## Privacy, PWA, and response policy

- Normal live desktop and mobile flows made zero outbound requests. Source and
  runtime review found no analytics, advertising, third-party fonts, or CDN
  scripts. The only optional external path is Sociobot license checkout and
  verification; it does not include deck content.
- The manifest has standalone display, token-matched colors, versioned start
  URL, and 192/512 icons with a maskable 512px icon. User records are stored in
  IndexedDB and the export path uses AES-256-GCM/PBKDF2 in-browser encryption.
- Fresh PWA simulation confirmed the app shell was cached, an offline reload
  returned the app, and a byte-changed second `sw.js` caused the in-app “A
  fresh version is ready.” update toast.
- Live HTTPS is valid: certificate CN/SAN is
  `interview-recall-deck.sociobot.in`, issued by GeoTrust and valid through
  2027-02-27. Root and `sw.js` return `Cache-Control: public, max-age=0,
  must-revalidate`; hashed assets return `public, max-age=31536000, immutable`.
  CSP, Permissions-Policy, HSTS, Referrer-Policy, and `nosniff` are present.
- SHA-256 parity check matched all 19 deployable candidate files served by the
  host. `staticwebapp.config.json` is intentionally not served by the provider
  and was excluded from that comparison.

## Defects

No release-blocking defects found. No P0/P1/P2 defects were observed.

## Notes

No Lighthouse score is claimed: the installed repository contains no Lighthouse
runner. The measured bundle/image budgets, response caching, visual review,
browser error checks, offline reload, and axe checks above were completed.
