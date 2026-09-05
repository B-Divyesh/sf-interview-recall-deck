import { readFile } from 'node:fs/promises';
import { expect, test } from 'vitest';

test('static deployment keeps the shell revalidated and hashed assets immutable', async () => {
  const config = JSON.parse(await readFile(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')) as {
    globalHeaders: Record<string, string>;
    routes: { route: string; headers: Record<string, string> }[];
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  };
  expect(config.globalHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
  expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
  expect(config.routes).toContainEqual({ route: '/sw.js', headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } });
  expect(config.routes).toContainEqual({ route: '/deck', rewrite: '/index.html' });
  expect(config.routes).toContainEqual({ route: '/edit', rewrite: '/index.html' });
  expect(config.routes).toContainEqual({ route: '/rehearse', rewrite: '/index.html' });
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
});
