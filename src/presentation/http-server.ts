import { once } from 'node:events';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

export async function startHttpServer(port: number) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error('PORT must be an integer from 0 to 65535.');
  }

  const app = new Hono();
  app.get('/health', (context) => context.json({ status: 'ok' }));

  app.get('/echo', (context) => {
    const text = context.req.query('text');
    if (text === undefined) {
      return context.json({ error: 'Missing query parameter: text' }, 400);
    }

    return context.json({ text });
  });

  app.notFound((context) => context.json({ error: 'Not Found' }, 404));

  const server = serve({ fetch: app.fetch, port, hostname: '127.0.0.1' });
  await once(server, 'listening');
  return server;
}
