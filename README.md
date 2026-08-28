# Interview Recall Deck

Interview Recall Deck is an offline-first preparation tool for job seekers who
find it hard to retrieve concrete examples under interview pressure. It turns
the user’s own projects into short evidence cards, supports calm timed rehearsal,
and produces a one-page pre-interview recall sheet.

It is deliberately not an answer generator: every situation, action, result,
and cue comes from the user. There is no account, cloud sync, analytics, or
diagnostic claim. Data lives in IndexedDB in the current browser.

Live site: <https://interview-recall-deck.sociobot.in>

## Features

- Structured situation/action/result cards with competency tags and recall cues
- 60- or 90-second pausable rehearsal with evidence hidden until requested
- User-initiated text-to-speech and optional browser-native dictation
- Printable one-page recall sheet grouped by competency
- AES-256-GCM encrypted JSON backup/import and readable CSV export
- Installable PWA with a versioned app-shell cache and offline reload support
- Free six-example deck; $9 one-time license unlock for unlimited examples,
  longer rounds, and local rehearsal history
- Keyboard operation, strong focus states, reduced motion, and a 390px mobile UI

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Local development uses the Sociobot pilot billing
API; the deployed `*.sociobot.in` site uses the production API.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

The exact production build command is `npm run build`. Output lands in `dist/`
with `dist/index.html` at its root. The end-to-end test expects the production
build to exist and automatically serves it with `vite preview`. If Chromium is
not already present, run `npx playwright install chromium` once.

## Data and licensing

Examples, settings, and session history stay in the browser. The encrypted
backup passphrase is never stored and cannot be recovered. Speech recognition
is supplied by the browser and may use its vendor’s processing; using it is
optional.

The paid unlock follows the Sociobot hosted-checkout contract. No product ID or
payment-provider secret is embedded in this repository. Accessibility features,
rehearsal, the recall sheet, and all export paths remain free.

See [the visual thesis](.factory/design.md), [privacy](privacy/index.html), and
[terms](terms/index.html) for more detail.

## Deployment

Deploy the contents of `dist/` as a static site. History fallback is not needed
for app navigation because app routes use URL fragments; `/privacy/` and
`/terms/` are emitted as real static paths. `public/staticwebapp.config.json`
ships with the build: it revalidates HTML and `sw.js`, caches hashed `/assets/`
for one year with `immutable`, and sends the product response-policy headers.

## License

MIT. See [LICENSE](LICENSE).
