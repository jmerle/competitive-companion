import { Sendable } from './Sendable';

export class Contest implements Sendable {
  constructor(public tasks: Sendable[]) {}

  public async send(): Promise<void> {
    for (const task of this.tasks) {
      await task.send();
    }
  }
}
