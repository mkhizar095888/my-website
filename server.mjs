import http from 'node:http';
import { createHash } from 'node:crypto';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const gzipAsync = promisify(gzip);
const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, 'public');
const port = Number(process.env.PORT || 3000);
const cache = new Map();
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};
const compressible = new Set(['.html', '.css', '.js', '.json', '.svg']);
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self'; form-action 'self'",
};

function getFilePath(rawPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || !decoded.startsWith('/')) return null;
  if (decoded === '/') return path.join(root, 'index.html');
  if (decoded === '/manus-routes.json') return path.join(publicRoot, 'manus-routes.json');
  if (decoded.startsWith('/assets/')) {
    const assetRoot = path.join(publicRoot, 'assets');
    const candidate = path.join(assetRoot, decoded.slice('/assets/'.length));
    const relative = path.relative(assetRoot, candidate);
    return relative.startsWith('..') || path.isAbsolute(relative) ? null : candidate;
  }
  if (['/styles.css', '/script.js'].includes(decoded)) return path.join(root, decoded.slice(1));
  if (!path.extname(decoded)) return path.join(root, 'index.html');
  return null;
}

function isInsideRoot(filePath) {
  const relative = path.relative(root, filePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function wantsGzip(req, ext) {
  return compressible.has(ext) && /(?:^|,)\s*gzip(?:\s*;|,|$)/i.test(req.headers['accept-encoding'] || '');
}

async function getPayload(filePath, req) {
  const fileStat = await stat(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const encoding = wantsGzip(req, ext) ? 'gzip' : 'identity';
  const key = `${filePath}:${encoding}`;
  const cached = cache.get(key);
  if (cached && cached.mtimeMs === fileStat.mtimeMs && cached.size === fileStat.size) return cached;

  const source = await readFile(filePath);
  const body = encoding === 'gzip' ? await gzipAsync(source, { level: 6 }) : source;
  const payload = {
    body,
    etag: `"${createHash('sha1').update(body).digest('hex').slice(0, 16)}"`,
    contentType: mime[ext] || 'application/octet-stream',
    encoding,
    mtimeMs: fileStat.mtimeMs,
    size: fileStat.size,
  };
  cache.set(key, payload);
  return payload;
}

function send(res, status, headers, body = '') {
  res.writeHead(status, { ...securityHeaders, ...headers });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method || '')) {
    send(res, 405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' }, 'Method not allowed');
    return;
  }

  const rawPath = (req.url || '/').split('?')[0];
  const filePath = getFilePath(rawPath);
  if (!filePath || !isInsideRoot(filePath)) {
    send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'Not found');
    return;
  }

  try {
    const payload = await getPayload(filePath, req);
    const isHtml = path.extname(filePath).toLowerCase() === '.html';
    const isRouteManifest = rawPath === '/manus-routes.json';
    const cacheControl = isHtml || isRouteManifest
      ? 'no-cache'
      : 'public, max-age=3600, must-revalidate';
    const headers = {
      'Content-Type': payload.contentType,
      'Content-Length': payload.body.length,
      'Cache-Control': cacheControl,
      ETag: payload.etag,
      Vary: 'Accept-Encoding',
    };
    if (payload.encoding === 'gzip') headers['Content-Encoding'] = 'gzip';
    if (req.headers['if-none-match'] === payload.etag) {
      send(res, 304, { ETag: payload.etag, 'Cache-Control': cacheControl, Vary: 'Accept-Encoding' });
      return;
    }
    send(res, 200, headers, req.method === 'HEAD' ? undefined : payload.body);
  } catch {
    send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'Not found');
  }
});

server.keepAliveTimeout = 5_000;
server.headersTimeout = 10_000;
server.requestTimeout = 10_000;
server.maxHeadersCount = 50;
server.on('clientError', (_error, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});
server.listen(port, '0.0.0.0', () => {
  console.log(`VarenzoX hardened preview listening on http://0.0.0.0:${port}`);
});
