/*
 * Local static server + API proxy that mirrors the Vercel config (vercel.json).
 * Serves the exported `dist/` and proxies /api/* to the live GRM backend so the
 * web demo can be tested locally exactly as it behaves in production.
 *
 *   node scripts/serve-dist.js [port]
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || process.argv[2] || 4321;
const DIST = path.resolve(__dirname, '..', 'dist');
const BACKEND = 'https://grm-web-app-benin.vercel.app';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function proxy(req, res) {
  const targetPath = req.url.replace(/^\/api/, '');
  const url = new URL(BACKEND + targetPath);
  const headers = { ...req.headers, host: url.host };
  delete headers['accept-encoding'];
  const upstream = https.request(
    url,
    { method: req.method, headers },
    (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    }
  );
  upstream.on('error', (e) => {
    res.writeHead(502);
    res.end('Proxy error: ' + e.message);
  });
  req.pipe(upstream);
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.join(DIST, urlPath);
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback
      filePath = path.join(DIST, 'index.html');
    }
    fs.readFile(filePath, (e, data) => {
      if (e) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
      });
      res.end(data);
    });
  });
}

http
  .createServer((req, res) => {
    if (req.url.startsWith('/api/') || req.url === '/api') return proxy(req, res);
    return serveStatic(req, res);
  })
  .listen(PORT, () => {
    console.log(`Serving dist/ on http://localhost:${PORT} (api -> ${BACKEND})`);
  });
