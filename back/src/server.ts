import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { knapsack } from './algorithms/knapsack.ts';
import { sushiMenu, defaultPlateCapacity, regenerateMenu } from './game/menu.ts';
import { generateCustomer } from './game/round.ts';
import { evaluatePlate } from './game/evaluate.ts';

const PORT = Number(process.env.PORT ?? 3000);
const frontDir = path.resolve(process.cwd(), '../front');

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

async function sendFile(res: ServerResponse, filePath: string): Promise<void> {
  try {
    const data = await readFile(filePath);
    const extension = path.extname(filePath);
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };

    res.writeHead(200, {
      'Content-Type': mimeTypes[extension] ?? 'application/octet-stream',
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Arquivo não encontrado');
  }
}

function readJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Corpo da requisição muito grande.'));
      }
    });

    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('JSON inválido.'));
      }
    });

    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const routePath = url.pathname;
  const method = req.method ?? 'GET';

  if (method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (method === 'GET' && routePath === '/game/menu') {
      // Nova partida: sorteia um cardápio novo (status aleatórios por faixa).
      sendJson(res, 200, {
        menu: regenerateMenu(),
        defaultPlateCapacity,
      });
      return;
    }

    if (method === 'POST' && routePath === '/game/round') {
      const body = await readJson(req);
      const capacity = Number(body.capacity ?? defaultPlateCapacity);

      // generateCustomer já retorna { capacity, customer } com prato e fome
      // aleatórios — repassamos direto pra não aninhar duas vezes.
      sendJson(res, 200, generateCustomer(sushiMenu, capacity));
      return;
    }

    if (method === 'POST' && routePath === '/game/evaluate') {
      const body = await readJson(req);
      const selectedNames = Array.isArray(body.selectedNames) ? body.selectedNames : [];
      const capacity = Number(body.capacity ?? defaultPlateCapacity);
      const hunger = Number(body.hunger ?? 0);

      sendJson(res, 200, evaluatePlate(sushiMenu, selectedNames, capacity, hunger));
      return;
    }

    if (method === 'POST' && routePath === '/algorithms/knapsack') {
      const body = await readJson(req);
      const items = Array.isArray(body.items) ? body.items : sushiMenu;
      const capacity = Number(body.capacity ?? defaultPlateCapacity);

      sendJson(res, 200, knapsack(items, capacity));
      return;
    }

    if (method === 'GET' && (routePath === '/' || routePath === '/index.html')) {
      await sendFile(res, path.join(frontDir, 'index.html'));
      return;
    }

    if (method === 'GET') {
      const requestedFile = path.join(frontDir, routePath.replace(/^\/+/, '') || 'index.html');
      await sendFile(res, requestedFile);
      return;
    }

    sendJson(res, 404, { error: 'Rota não encontrada.' });
  } catch (err) {
    sendJson(res, 400, { error: (err as Error).message });
  }
});

server.listen(PORT, () => {
  console.log(`🎮 Jogo rodando em http://localhost:${PORT}`);
});
