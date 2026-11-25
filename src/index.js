const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!token) {
  console.error('Set TELEGRAM_BOT_TOKEN in .env or the environment.');
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error(`Telegram getUpdates failed (API ${data.error_code ?? response.status}).`);
      process.exitCode = 1;
    } else {
      for (const { message } of data.result) {
        if (typeof message?.text === 'string') {
          console.log(message.text);
        }
      }
    }
  } catch {
    console.error('Could not read updates from Telegram.');
    process.exitCode = 1;
  }
}
