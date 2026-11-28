import { setTimeout as delay } from 'node:timers/promises';

export async function pollMessages(checkMessages) {
  while (true) {
    await checkMessages(console.log);
    await delay(3000);
  }
}
