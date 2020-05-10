import { Sendable } from './Sendable';

export class Contest implements Sendable {
  public constructor(public tasks: Sendable[]) {}

  public async send(): Promise<void> {
    for (const task of this.tasks) {
      await task.send();
    }
  }
}
