import { Sendable } from './Sendable';

export class Contest implements Sendable {
  constructor(public tasks: Sendable[]) {}

  public send(): Promise<void> {
    return new Promise(async resolve => {
      for (const task of this.tasks) {
        await task.send();
      }

      resolve();
    });
  }
}
