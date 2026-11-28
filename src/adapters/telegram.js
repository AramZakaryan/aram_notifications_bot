function toUpdate({ update_id, message }) {
  const update = { id: update_id };
  if (typeof message?.text === 'string') {
    update.message = {
      chatId: message.chat.id,
      id: message.message_id,
      threadId: message.message_thread_id,
      text: message.text,
    };
  }
  return update;
}

export function createTelegramAdapter(token) {
  async function request(method, parameters = {}) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters),
      });
      const data = await response.json();
      if (response.ok && data.ok) return data.result;

      console.error(`Telegram ${method} failed (API ${data.error_code ?? response.status}).`);
    } catch {
      console.error(`Could not complete Telegram ${method} request.`);
    }
    return null;
  }

  return {
    async getUpdates() {
      const updates = await request('getUpdates');
      return (updates ?? []).map(toUpdate);
    },

    async sendReply(message, text) {
      const characters = Array.from(text);
      for (let start = 0; start < characters.length; start += 4096) {
        const sent = await request('sendMessage', {
          chat_id: message.chatId,
          message_thread_id: message.threadId,
          reply_parameters: { message_id: message.id },
          text: characters.slice(start, start + 4096).join(''),
        });
        if (!sent) return false;
      }
      return true;
    },

    async confirmUpdates(lastProcessedId) {
      // Telegram confirms only updates with IDs below the offset.
      await request('getUpdates', { offset: lastProcessedId + 1, limit: 1 });
    },
  };
}
