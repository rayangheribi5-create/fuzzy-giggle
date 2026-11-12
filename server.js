// Serveur de production : sert le build Vite (dist) + fallback SPA.
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function sendFile(res, filePath) {
  const info = await stat(filePath);
  if (!info.isFile()) throw new Error('not a file');
  const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': info.size,
    'Cache-Control': filePath.endsWith('.html')
      ? 'no-cache'
      : 'public, max-age=3600',
  });
  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, app: 'auticolor' }));
      return;
    }

    const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    const candidate = join(root, safePath);
    if (!candidate.startsWith(root)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    try {
      await sendFile(res, candidate);
      return;
    } catch {
      // fichier absent -> fallback SPA
    }

    await sendFile(res, join(root, 'index.html'));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erreur serveur');
  }
});

server.listen(port, host, () => {
  console.log(`AutiColor écoute sur http://${host}:${port}`);
});
