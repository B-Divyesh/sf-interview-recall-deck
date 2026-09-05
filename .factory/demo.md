# Demo sandbox

- Direct URL: `https://interview-recall-deck.sociobot.in/demo`
- Alias: `https://interview-recall-deck.sociobot.in/?demo=1`
- Sample: three work examples covering problem solving, ownership, communication, and initiative.
- First action: choose “Try it with sample data” on the landing screen.
- Reset: choose “Reset demo” in the persistent demo banner.
- Exit: choose “Start for real.” This deletes the demo database and opens the real deck.
- Isolation: real data uses IndexedDB `interview-recall-deck`; demo data uses `demo:interview-recall-deck`. Demo query state stays on legal pages and browser-history routes.
- Offline: visit the demo once while online, wait for its service worker, then reload it offline.
