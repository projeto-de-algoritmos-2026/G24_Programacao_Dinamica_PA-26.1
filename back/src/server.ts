import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { knapsack } from './algorithms/knapsack.js';
import { sushiMenu, defaultPlateCapacity } from './game/menu.js';
import { generateCustomer } from './game/round.js';
import { evaluatePlate } from './game/evaluate.js';
import { openapiSpec, swaggerHtml } from './game/openapi.js';

const PORT = Number(process.env.PORT) || 3000;

function send(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
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
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method ?? 'GET';

  if (method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }

  try {
    // Documentação interativa (Swagger UI).
    if (method === 'GET' && path === '/docs') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(swaggerHtml);
      return;
    }

    if (method === 'GET' && path === '/api/openapi.json') {
      send(res, 200, openapiSpec);
      return;
    }

    if (method === 'GET' && path === '/api/menu') {
      send(res, 200, { menu: sushiMenu, defaultPlateCapacity });
      return;
    }

    if (method === 'POST' && path === '/api/round') {
      const body = await readJson(req);
      const capacity = Number(body.capacity ?? defaultPlateCapacity);
      const customer = generateCustomer(sushiMenu, capacity);
      send(res, 200, { capacity, customer });
      return;
    }

    if (method === 'POST' && path === '/api/solve') {
      const body = await readJson(req);
      const items = Array.isArray(body.items) ? body.items : sushiMenu;
      const capacity = Number(body.capacity ?? defaultPlateCapacity);
      send(res, 200, knapsack(items, capacity));
      return;
    }

    if (method === 'POST' && path === '/api/evaluate') {
      const body = await readJson(req);
      const selectedNames = Array.isArray(body.selectedNames)
        ? body.selectedNames
        : [];
      const capacity = Number(body.capacity ?? defaultPlateCapacity);
      const hunger = Number(body.hunger ?? 0);
      send(res, 200, evaluatePlate(sushiMenu, selectedNames, capacity, hunger));
      return;
    }

    send(res, 404, { error: 'Rota não encontrada.' });
  } catch (err) {
    send(res, 400, { error: (err as Error).message });
  }
});

server.listen(PORT, () => {
  console.log(`🍣 API do jogo rodando em http://localhost:${PORT}`);
});
