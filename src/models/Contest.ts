import { Sendable } from './Sendable';

export class Contest implements Sendable {
  constructor(public tasks: Sendable[]) {
  }

  send(): Promise<void> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < this.tasks.length; i++) {
        await this.tasks[i].send();
      }

      resolve();
    });
  }
}
