# Project instructions

This is a Telegram bot running on Node.js 24 or later.

- `npm start` starts the bot and its Hono server. The bot checks Telegram immediately, then waits three seconds after each check. Press Ctrl+C to stop both.
- `GET /health` returns HTTP 200 with `{"status":"ok"}`. The server listens on `127.0.0.1` and uses port `3000` unless `PORT` is set.
- `npm run check` runs the TypeScript compiler without emitting files. Run it after changing source files. Use mocked Telegram responses when verifying message handling.
- Read `TELEGRAM_BOT_TOKEN` from the environment or the local `.env` file. Keep tokens out of source control and logs.

## Architecture

- **Presentation** (`src/presentation/`) runs the polling loop, handles terminal output, and defines the HTTP health endpoint.
- **Application** (`src/application/`) owns the use case: read new messages, form the reply, and confirm updates after processing. It receives the operations it needs as arguments and has no direct dependency on Telegram, terminal output, or timers.
- **Adapters** (`src/adapters/`) translate between the application's data and the Telegram Bot API. Keep HTTP requests, Telegram field names, and offset arithmetic here.
- **Composition root** (`src/index.ts`) reads configuration and wires these parts together.
