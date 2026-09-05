# Handoff — verification 3

## Status: PASS

- Product: Interview Recall Deck, a local-first PWA for job seekers recalling truthful work examples in interviews.
- Implementation SHA: `9581fd43af8805f60ccad886d6416fcfe30c2a54`
- Documentation SHA reviewed: `35cf7a07cc778db425aac044a8b8358201fe1551`
- Live URL: <https://interview-recall-deck.sociobot.in>
- Full independent report: `.factory/verification-3.md`
- Findings: 0. Untested public claims: 0.

## What was verified

From clean setup, `npm ci`, `npm test` (7/7), `npm run lint`, `npm run build`,
`npm run test:e2e` (48/48), and `npm run test:node20` all passed. Each of the
17 commands declared in `.factory/claims.json` was also invoked independently;
all passed.

Fresh live desktop and 390px phone contexts verified the first-screen job,
audience, and sample action; populated sample deck; persistent banner; reset;
demo deletion on exit; and byte-for-byte preservation of seeded real data across
demo editing and Privacy/Terms navigation. Live PWA offline reload/rehearsal,
20 route/device Axe checks with no serious/critical violations, keyboard focus,
reduced motion, link crawl, per-route titles, legal pages, and shared HTTP 404
were verified.

## Run and verify

```sh
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
npm run test:node20
```

The direct sample entry is `/demo`; its storage namespace is
`demo:interview-recall-deck`. Start for real deletes that namespace and opens the
separate real deck.

## Known gaps and next steps

There are no known product defects. New $9 licenses are deliberately unavailable
and the status is covered by the `purchase-unavailable` claim. Before a future
paid release, register and test the Sociobot checkout before exposing a purchase
action.
