import { createTelegramAdapter } from './adapters/telegram.ts';
import { checkMessages } from './application/check-messages.ts';
import { startHttpServer } from './presentation/http-server.ts';
import { pollMessages } from './presentation/poll-messages.ts';

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!token) {
  console.error('Set TELEGRAM_BOT_TOKEN in .env or the environment.');
  process.exit(1);
}

const port = Number(process.env.PORT ?? 3000);
const server = await startHttpServer(port);
const address = server.address();
if (!address || typeof address === 'string') {
  throw new Error('The health server did not bind to a TCP port.');
}
console.log(`Health endpoint: http://127.0.0.1:${address.port}/health`);

const telegram = createTelegramAdapter(token);
await pollMessages((showMessage) => checkMessages(telegram, showMessage));
