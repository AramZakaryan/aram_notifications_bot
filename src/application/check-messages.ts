export interface IncomingMessage {
  chatId: number;
  id: number;
  threadId?: number;
  text: string;
}

export interface MessageUpdate {
  id: number;
  message?: IncomingMessage;
}

export interface MessageOperations {
  getUpdates(): Promise<MessageUpdate[]>;
  sendReply(message: IncomingMessage, text: string): Promise<boolean>;
  confirmUpdates(lastProcessedId: number): Promise<void>;
}

export async function checkMessages(
  { getUpdates, sendReply, confirmUpdates }: MessageOperations,
  showMessage: (text: string) => void,
) {
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
