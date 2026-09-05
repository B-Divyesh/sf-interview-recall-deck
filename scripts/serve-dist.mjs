import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4173);
const appRoutes = ['/demo', '/deck', '/edit', '/rehearse', '/sheet', '/settings', '/privacy', '/terms'];
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

function headers(pathname) {
  return {
    'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; connect-src 'self' https://api.sociobot.in https://pilot-api.sociobot.in; img-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; manifest-src 'self'; worker-src 'self'",
    'Permissions-Policy': 'camera=(), geolocation=(), payment=(), usb=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate'
  };
}

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
  let status = 200;
  let file = pathname === '/' || appRoutes.includes(pathname) ? 'index.html' : pathname.slice(1);
  if (pathname === '/staticwebapp.config.json') file = 'missing';
  let full = normalize(join(root, file));
  if (!full.startsWith(root)) full = join(root, 'missing');
  try {
    if ((await stat(full)).isDirectory()) full = join(full, 'index.html');
    const body = await readFile(full);
    response.writeHead(status, { ...headers(pathname), 'Content-Type': mime[extname(full)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    status = 404;
    const body = await readFile(join(root, '404.html'));
    response.writeHead(status, { ...headers(pathname), 'Content-Type': 'text/html; charset=utf-8' });
    response.end(body);
  }
}).listen(port, '127.0.0.1', () => process.stdout.write(`dist server http://127.0.0.1:${port}\n`));
