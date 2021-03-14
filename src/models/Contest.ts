import { Sendable } from './Sendable';
import { Task } from './Task';

export class Contest implements Sendable {
  public constructor(public tasks: Task[]) {
    for (const task of tasks) {
      task.batch.id = tasks[0].batch.id;
      task.batch.size = tasks.length;
    }
  }

  public async send(): Promise<void> {
    for (const task of this.tasks) {
      await task.send();
    }
  }
}
