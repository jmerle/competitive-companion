import { Sendable } from './Sendable';
import { Config } from '../utils/Config';

export class Contest implements Sendable {
  constructor(public tasks: Sendable[]) {
  }

  send(): Promise<void> {
    return new Promise(async (resolve) => {
      Config.get<boolean>('debugMode').then(async debug => {
        if (debug) {
          console.log(JSON.stringify(this.tasks, null, 4));
        }

        const oldLog = console.log;
        console.log = () => {};

        for (let i = 0; i < this.tasks.length; i++) {
          await this.tasks[i].send();
        }

        console.log = oldLog;

        resolve();
      }).catch(console.error);
    });
  }
}
