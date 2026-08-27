# Handoff — Interview Recall Deck

## What shipped

- A complete Vite + vanilla TypeScript offline PWA for capturing the user’s own
  situation/action/result evidence, tagging competencies, and adding short cues.
- A timed 60/90-second rehearsal with pause/resume, optional TTS, optional
  browser dictation, delayed evidence reveal, and a non-judgmental self-check.
- A printable one-page recall sheet grouped by competency, showing up to three
  concrete examples per competency and visible gaps toward the pilot goal.
- IndexedDB persistence plus AES-256-GCM/PBKDF2 encrypted JSON export/import and
  readable CSV export. There are no accounts, analytics, CDNs, or cloud copies.
- A useful six-example free tier. The $9 one-time Sociobot unlock adds unlimited
  cards, longer rounds, and local rehearsal history. Checkout, callback token
  capture, daily-cached verification, restore, revocation, and offline-safe
  behavior follow the paid-unlock contract. No product ID is hardcoded.
- PWA manifest, authored 192/512 icons, generated versioned service worker,
  offline fallback, update notice, and mobile safe-area navigation.
- Real `/privacy/` and `/terms/` pages, README, MIT license, robots, and sitemap.
- The original generated hero illustration and its prompt/provenance are stored
  in `assets/src/`; shipped WebP variants are 39 KB and 96 KB.

## Verification

Run from a clean checkout:

```sh
npm install
npm test
npm run build
npx playwright install chromium   # once, when the browser is absent
npm run test:e2e
```

- `npm test`: 5/5 unit tests pass, including encrypted-backup round trip and
  wrong-passphrase handling.
- `npm run build`: passes TypeScript and Vite production builds; output is
  `dist/` with `index.html` at its root.
- `npm run test:e2e`: exercises a Pixel 5-sized viewport (393px), create,
  IndexedDB persistence, a true offline page reload, rehearsal completion,
  recall sheet, and both legal pages. It also asserts no console errors and runs
  axe with zero serious/critical findings.
- Lighthouse 12.8.2 mobile, run against the production preview on 2026-08-27:
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s,
  LCP 1.2s, TBT 0ms, CLS 0, total transfer 57 KiB.
- Production assets: initial JavaScript 32.61 KB (11.57 KB gzip), app CSS 18.60
  KB (5.01 KB gzip), mobile hero 39 KB. All are inside the specified budgets.
- `npm audit`: 0 known vulnerabilities after upgrading the image build tool.
- Desktop and full-page 393px screenshots were manually reviewed for overflow,
  hierarchy, fixed navigation placement, contrast, and artwork quality.

## Known gaps / release notes

- Browser dictation depends on the browser/OS speech-recognition implementation;
  unsupported or denied cases fall back to typed or thought-aloud rehearsal.
- The factory still needs to register the product/return URL with the Sociobot
  billing engine. Localhost intentionally uses `pilot-api.sociobot.in`; the live
  Sociobot hostname automatically uses the production API.
- Cross-device sync is intentionally absent to keep sensitive career details
  local. Users move data with encrypted backups.
- No real-user seven-day outcome data exists yet; the product makes the target
  (three examples per competency) visible on the recall sheet for pilot study.
