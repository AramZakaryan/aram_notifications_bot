import { setTimeout as delay } from 'node:timers/promises';

export async function pollMessages(
  checkMessages: (showMessage: (text: string) => void) => Promise<void>,
): Promise<never> {
  while (true) {
    await checkMessages(console.log);
    await delay(3000);
  }
}
