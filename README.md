# Interview Recall Deck

Interview Recall Deck helps job seekers recall real work examples under interview pressure.

Try the isolated sample deck at <https://interview-recall-deck.sociobot.in/demo>.
It includes three realistic examples and never reads or changes your real deck.

## What it does

- Capture the situation, your action, the result, interview skills, and a recall cue.
- Rehearse for 60 or 90 seconds, pause, resume, and reveal your saved evidence.
- Read prompts aloud or use optional browser dictation after you choose it.
- Print a one-page recall sheet grouped by interview skill.
- Download an encrypted backup or a readable CSV file.
- Install the app and reopen the sample deck offline after your first visit.

The app does not generate interview answers. Your examples, settings, and rehearsal history stay in this browser. There is no account, cloud sync, analytics, or tracking.

The free deck holds six examples. Rehearsal, the recall sheet, accessibility controls, backups, and CSV exports stay free. New $9 license purchases are paused while checkout is repaired. Existing license holders can restore access in Settings.

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The direct demo entry is `http://localhost:5173/demo` or `/?demo=1`.

## Test and build

```sh
npm test
npm run lint
npm run build
npm run test:e2e
```

Each entry in [`.factory/claims.json`](.factory/claims.json) names its exact browser command. Build output goes to `dist/`, with `index.html` at its root.

## Privacy and data

Real data uses the `interview-recall-deck` IndexedDB database. Demo data uses `demo:interview-recall-deck`. Leaving or resetting the demo deletes its data.

Encrypted backups use AES-256-GCM. The passphrase is not stored and cannot be recovered. Dictation uses browser speech recognition, whose vendor may process audio.

See the [visual thesis](.factory/design.md), [privacy policy](https://interview-recall-deck.sociobot.in/privacy), and [terms](https://interview-recall-deck.sociobot.in/terms).

## Deployment

Run `npm run build`, then deploy `dist/` as a static site. `staticwebapp.config.json` rewrites known app routes, returns the designed 404 for unknown paths, and sets cache and security headers.

The factory command is:

```sh
/opt/fleet/lib/deploy-static.sh interview-recall-deck dist
```

## License

MIT. See [LICENSE](LICENSE).
