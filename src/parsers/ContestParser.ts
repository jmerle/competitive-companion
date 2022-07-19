import { Contest } from '../models/Contest';
import { Sendable } from '../models/Sendable';
import { Task } from '../models/Task';
import { Parser } from './Parser';

export abstract class ContestParser<T> extends Parser {
  protected abstract getTasksToParse(html: string, url: string): Promise<T[]>;

  protected abstract parseTask(id: T): Promise<Task>;

  public async parse(url: string, html: string): Promise<Sendable> {
    const tasksToParse = await this.getTasksToParse(html, url);
    const parsedTasks = [];
    const failedTasks = [];

    for (let i = 0; i < tasksToParse.length; i++) {
      try {
        const task = await this.parseTask(tasksToParse[i]);
        parsedTasks.push(task);
      } catch (error) {
        console.error(`Failed to parse task ${i + 1}:`, error);
        failedTasks.push(i + 1);
      }

      (window as any).nanoBar.go(((i + 1) / tasksToParse.length) * 100);
    }

    if (failedTasks.length === tasksToParse.length) {
      throw new Error('Failed to parse any task.');
    }

    if (failedTasks.length > 0) {
      let failedMessage;
      if (failedTasks.length === 1) {
        failedMessage = `problem ${failedTasks[0]}, see the browser console for the parsing error`;
      } else {
        const firstTasks = failedTasks.slice(0, failedTasks.length - 1).join(', ');
        const lastTask = failedTasks[failedTasks.length - 1];
        failedMessage = `problems ${firstTasks}, and ${lastTask}, see the browser console for the parsing errors`;
      }

      let successMessage;
      if (parsedTasks.length === 1) {
        successMessage = 'problem was parsed';
      } else {
        successMessage = 'problems were parsed';
      }

      alert(
        [
          `Competitive Companion's ${this.constructor.name} failed to parse ${failedMessage}.`,
          `The remaining ${successMessage} successfully.`,
          'Please open an issue at https://github.com/jmerle/competitive-companion/issues if you think this is a bug (make sure to include a link to this page).',
        ].join(' '),
      );
    }

    return new Contest(parsedTasks);
  }
}
