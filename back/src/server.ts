import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getMenu } from './game/menu.ts';
import { createRound } from './game/round.ts';
import { evaluatePlate } from './game/evaluate.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../../front');

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function sendFile(res: ServerResponse, filePath: string) {
  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] ?? 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

export function createApp() {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/game/menu') {
      return sendJson(res, 200, {
        menu: getMenu(),
        defaultPlateCapacity: 20,
      });
    }

    if (req.method === 'POST' && url.pathname === '/game/round') {
      const body = await readJsonBody(req);
      const capacity = Number(body.capacity ?? 20);
      return sendJson(res, 200, createRound(capacity));
    }

    if (req.method === 'POST' && url.pathname === '/game/evaluate') {
      const body = await readJsonBody(req);
      const menu = getMenu();
      const selectedNames = Array.isArray(body.selectedNames)
        ? body.selectedNames.filter((name): name is string => typeof name === 'string')
        : [];
      const capacity = Number(body.capacity ?? 20);

      return sendJson(res, 200, evaluatePlate(menu, selectedNames, capacity));
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      return sendFile(res, path.join(frontendDir, 'index.html'));
    }

    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const safePath = path.join(frontendDir, requestedPath.replace(/^\/+/, ''));
    const resolvedPath = path.resolve(safePath);

    if (resolvedPath.startsWith(frontendDir)) {
      return sendFile(res, resolvedPath);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
}
