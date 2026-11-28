import { once } from 'node:events';
import express from 'express';

export async function startHttpServer(port: number) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('PORT must be an integer from 0 to 65535.');
  }

  const app = express();

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  const server = app.listen(port, '127.0.0.1');
  await once(server, 'listening');
  return server;
}
