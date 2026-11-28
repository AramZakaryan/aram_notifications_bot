export async function checkMessages({ getUpdates, sendReply, confirmUpdates }, showMessage) {
  let lastProcessedId = 0;
  const updates = await getUpdates();

  for (const { id, message } of updates) {
    if (message) {
      const sent = await sendReply(message, `received: "${message.text}"`);
      if (!sent) break;
      showMessage(message.text);
    }
    lastProcessedId = Math.max(lastProcessedId, id);
  }

  if (lastProcessedId > 0) {
    await confirmUpdates(lastProcessedId);
  }
}
