import type { MessageOperations, MessageUpdate } from '../application/check-messages.ts';

interface TelegramMessage {
  chat: { id: number };
  message_id: number;
  message_thread_id?: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

type TelegramResponse<Result> =
  | { ok: true; result: Result }
  | { ok: false; error_code?: number };

function toUpdate({ update_id, message }: TelegramUpdate): MessageUpdate {
  const update: MessageUpdate = { id: update_id };
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

export function createTelegramAdapter(token: string): MessageOperations {
  async function request<Result>(
    method: 'getUpdates' | 'sendMessage',
    parameters: Record<string, unknown> = {},
  ): Promise<Result | null> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters),
      });
      const data: TelegramResponse<Result> = await response.json();
      if (response.ok && data.ok) return data.result;

      const errorCode = data.ok ? response.status : data.error_code ?? response.status;
      console.error(`Telegram ${method} failed (API ${errorCode}).`);
    } catch {
      console.error(`Could not complete Telegram ${method} request.`);
    }
    return null;
  }

  return {
    async getUpdates() {
      const updates = await request<TelegramUpdate[]>('getUpdates');
      return (updates ?? []).map(toUpdate);
    },

    async sendReply(message, text) {
      const characters = Array.from(text);
      for (let start = 0; start < characters.length; start += 4096) {
        const sent = await request<TelegramMessage>('sendMessage', {
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
      await request<TelegramUpdate[]>('getUpdates', { offset: lastProcessedId + 1, limit: 1 });
    },
  };
}
