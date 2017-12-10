import Sendable from "./Sendable";
import Task from "./Task";

export default class Contest implements Sendable {
  constructor(public tasks: Task[]) {
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
