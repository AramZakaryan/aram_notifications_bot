const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!token) {
  console.error('Set TELEGRAM_BOT_TOKEN in .env or the environment.');
  process.exit(1);
}

try {
  let offset = 0;
  for (const { update_id, message } of await getUpdates()) {
    if (typeof message?.text === 'string') {
      console.log(message.text);
    }
    offset = Math.max(offset, update_id + 1);
  }

  // Telegram confirms only updates with IDs below this offset.
  if (offset > 0) {
    await getUpdates(`?offset=${offset}&limit=1`);
  }
} catch {
  console.error('Could not complete a request to Telegram.');
  process.exitCode = 1;
}

async function getUpdates(query = '') {
  const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates${query}`);
  const data = await response.json();

  if (!response.ok || !data.ok) {
    console.error(`Telegram getUpdates failed (API ${data.error_code ?? response.status}).`);
    process.exitCode = 1;
    return [];
  }

  return data.result;
}
