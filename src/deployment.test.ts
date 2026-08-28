import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';

test('static deployment keeps the shell revalidated and hashed assets immutable', async () => {
  const config = JSON.parse(await readFile(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')) as {
    globalHeaders: Record<string, string>;
    routes: { route: string; headers: Record<string, string> }[];
  };
  expect(config.globalHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
  expect(config.routes).toContainEqual({ route: '/sw.js', headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } });
});
